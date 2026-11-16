"""Local synthetic fixtures only; never touch the real Aura vault or Gemini."""
import base64, io, json, tempfile, unittest
from pathlib import Path
import server
from unittest.mock import patch, MagicMock

class ChatMemoryTests(unittest.TestCase):
    def request(self, payload, model_text='{"reply":"A short reply.","memoryIds":[]}'):
        handler=server.Handler.__new__(server.Handler)
        body=json.dumps(payload).encode()
        handler.path='/api/chat'
        handler.headers={'Content-Length':str(len(body)),'Host':'127.0.0.1:4173','Origin':'http://127.0.0.1:4173','X-Aura-Token':server.TOKEN}
        handler.rfile=io.BytesIO(body)
        result=[]
        handler.reply=lambda status,data:result.append((status,data))
        upstream=MagicMock()
        upstream.__enter__.return_value=io.BytesIO(json.dumps({'candidates':[{'content':{'parts':[{'text':model_text}]},'finishReason':'STOP'}]}).encode())
        with patch.dict(server.os.environ,{'GEMINI_API_KEY':'test-only-key'}),patch.object(server.urllib.request,'urlopen',return_value=upstream) as call:
            handler.do_POST()
            sent=json.loads(call.call_args.args[0].data) if call.called else None
        return result[0],sent
    def test_joint_context_and_internal_reference_filter(self):
        body={'messages':[{'role':'user','text':'A fictional memory question'}], 'journal':[{'id':'journal:one','title':'Test','date':'2026-11-17','text':'Fictional journal context'}], 'weekly':[{'id':'weekly:one','week':'2026-11-16','answers':{'avoidance':2},'note':'Fictional weekly context'}]}
        (status,response),sent=self.request(body,'{"reply":"A short reply.","memoryIds":["journal:one","weekly:one","invented-id"]}')
        self.assertEqual(status,200)
        self.assertEqual(response['text'],'A short reply.')
        self.assertEqual(response['memoryIds'],['journal:one','weekly:one'])
        context=sent['contents'][-1]['parts'][0]['text']
        self.assertIn('Fictional journal context',context)
        self.assertIn('3–4 days',context)
        self.assertIn('weekly_reflections',context)
        self.assertEqual(sent['generationConfig']['responseMimeType'],'application/json')
    def test_invalid_quiz_or_feedback_rejected_before_provider(self):
        for extra in [{'weekly':[{'answers':{'avoidance':99}}]},{'weekly':[{'answers':{'avoidance':True}}]},{'sessionReviews':[{'helpfulness':'cured','feeling':'fixed'}]}]:
            (status,_),sent=self.request({'messages':[{'role':'user','text':'Test'}],**extra})
            self.assertEqual(status,400)
            self.assertIsNone(sent)
    def test_malformed_model_output_never_shown_as_reply(self):
        (status,response),_=self.request({'messages':[{'role':'user','text':'Test'}]},'not valid JSON')
        self.assertEqual(status,502)
        self.assertNotIn('not valid JSON',json.dumps(response))

class VaultTests(unittest.TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory()
        self.previous=server.VAULT_PATH
        server.VAULT_PATH=Path(self.directory.name)/'vault.json'
        self.record={'version':1,'kdf':'PBKDF2-SHA256','iterations':600000,'salt':base64.b64encode(b's'*16).decode(),'iv':base64.b64encode(b'i'*12).decode(),'data':base64.b64encode(b'ciphertext-fixture-not-real-plaintext').decode()}
    def tearDown(self):
        server.VAULT_PATH=self.previous
        self.directory.cleanup()
    def request(self, payload):
        handler=server.Handler.__new__(server.Handler)
        body=json.dumps(payload).encode()
        handler.headers={'Content-Length':str(len(body))}
        handler.rfile=io.BytesIO(body)
        result=[]
        handler.reply=lambda status,data:result.append((status,data))
        handler.save_vault()
        return result[0]
    def test_encrypted_save_and_revision_conflict(self):
        status,result=self.request({'expectedRevision':0,'vault':self.record})
        self.assertEqual(status,200)
        self.assertEqual(result['revision'],1)
        status,_=self.request({'expectedRevision':0,'vault':self.record})
        self.assertEqual(status,409)
        self.assertEqual(json.loads(server.VAULT_PATH.read_text())['revision'],1)
        status,_=self.request({'expectedRevision':1,'vault':self.record})
        self.assertEqual(status,200)
        self.assertFalse(server.VAULT_PATH.with_suffix('.tmp').exists())
    def test_plaintext_and_bad_format_rejected(self):
        status,_=self.request({'expectedRevision':0,'vault':{'journal':'private text'}})
        self.assertEqual(status,400)
        broken={**self.record,'iv':base64.b64encode(b'too-short').decode()}
        self.assertEqual(self.request({'expectedRevision':0,'vault':broken})[0],400)
        self.assertFalse(server.VAULT_PATH.exists())

if __name__=='__main__':
    unittest.main()

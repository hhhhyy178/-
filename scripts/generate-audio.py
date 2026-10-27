"""Build-time only. Install sherpa-onnx==1.12.40 + soundfile; pass model directory and text JSON.
Piper SIWIS fr_FR medium, source dataset CC BY 4.0. No network or API calls.
"""
import sys,json,hashlib,subprocess,tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
import sherpa_onnx
model=Path(sys.argv[1]);texts=json.loads(Path(sys.argv[2]).read_text());out=Path('public/audio');out.mkdir(parents=True,exist_ok=True)
config=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=str(model/'fr_FR-siwis-medium.onnx'),tokens=str(model/'tokens.txt'),data_dir=str(model/'espeak-ng-data'),noise_scale=.5,noise_scale_w=.6),num_threads=2,provider='cpu'),max_num_sentences=1)
assert config.validate()
tts=sherpa_onnx.OfflineTts(config);manifest={};metrics=[]
for i,text in enumerate(texts):
 key=hashlib.sha256(text.encode()).hexdigest()[:16];manifest[text]={'normal':f'audio/{key}.mp3','slow':f'audio/{key}-slow.mp3'}
 for suffix,speed in [('',1.0),('-slow',.8)]:
  path=out/f'{key}{suffix}.mp3'
  if path.exists():continue
  audio=tts.generate(text,sid=0,speed=speed);samples=np.asarray(audio.samples)
  assert len(samples)>audio.sample_rate*.15 and np.isfinite(samples).all(),text
  peak=float(np.abs(samples).max());assert peak>.001,text
  # Peak normalization only: no clipping; same voice and generated prosody at both speeds.
  samples=samples*(.9/peak)
  with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
   sf.write(tmp.name,samples,audio.sample_rate)
   subprocess.run(['ffmpeg','-v','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','64k',str(path)],check=True)
  metrics.append({'text':text,'variant':suffix or 'normal','seconds':len(samples)/audio.sample_rate,'peak':peak})
 if i%20==0:print(f'{i+1}/{len(texts)}',flush=True)
Path('lib/audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
Path('/tmp/bonjourlab-audio-metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2))
print(f'Generated {len(texts)} phrases, normal + slow',flush=True)

This guide explains how you can convert PyTorch models to NCNN models for Upscayl.

> [!IMPORTANT]
> Only PyTorch models are guaranteed to work. You can use a similar process for ONNX models (use onnxsim to simplify the model, install ONNX in dependencies and replace the orange blocks with their cyan equivalents), but it can often fail.

## Prerequisites
- [chaiNNer](https://github.com/chaiNNer-org/chaiNNer)
  - [This .chn file](https://gist.github.com/aaronliu0130/38b996f360dfee86d71130f129920f3a/raw/f06e711e03a4a239e6dc041fadf890a26fdd979a/pth2bin.chn). Right click the link, click "Save link as" and save it wherever you want.
- A model in PyTorch (.pth) format. This guide is for converting PyTorch to NCNN (Upscayl's format) only.
  - You can get models from https://openmodeldb.info/.
- A Text Editor

## Steps

1. Open chaiNNer and inside its dependency manager (the download button in the top right corner) install PyTorch and NCNN. ONNX is optional.
![Screenshot_from_2023-08-29_16-40-55](https://github.com/upscayl/upscayl/assets/11874211/5c5886bd-8fbe-478b-ab50-547bf269ce4d)
2. Set the correct GPU under the ONNX tab of the settings if you can.
![Screenshot from 2023-06-19 00-01-16](https://github.com/upscayl/upscayl/assets/25067102/3f2392c5-db28-4a03-84cb-d79d6dc1c68c)
3. Load the .chn file you downloaded in the Prerequisites section by clicking File → Open in chaiNNer.
4. Select the .pth model you want to convert by clicking the button that says "Click to select a file...".
5. Select an output folder under "Base Directory". 
6. Name that model by typing under "Param/Bin Name".
7. Press the Run button (▶️) on top of the window or press F5 on your keyboard.
![Screenshot_from_2023-08-29_16-53-31](https://github.com/upscayl/upscayl/assets/11874211/60fc9227-578e-4bdd-9b16-e0cfe2c7f7ec)
8. Wait for chaiNNer to finish converting. You'll get 2 files: a .bin and a .param
![Screenshot from 2023-06-18 23-49-50](https://github.com/upscayl/upscayl/assets/25067102/0c1fc3c2-1f80-4add-818c-feb4eecfe24d)
9. Open the .param file and change the first "input" on the second column and all "input"s (usually 2) in the third column to "data".
![Screenshot from 2023-06-18 23-50-51](https://github.com/upscayl/upscayl/assets/25067102/a0a020ce-107b-4e62-bf2c-3a025c569ee2)
10. Save the .param file and copy the .param and .bin file to your custom models folder named 'models'. If you don't have one, create it.
11. Open Upscayl and go to Settings → Add custom models and select your custom models folder.
![Screenshot from 2023-06-18 23-51-52](https://github.com/upscayl/upscayl/assets/25067102/cd3fda25-ca6d-4e9d-a33a-2ee61366cc8a)
![Screenshot from 2023-06-18 23-51-58](https://github.com/upscayl/upscayl/assets/25067102/16f6a401-2130-490a-981d-4487427c146a)
12. Your model should now appear at the bottom of your models list.
![Screenshot from 2023-06-18 23-52-03](https://github.com/upscayl/upscayl/assets/25067102/74e0b1cc-2ca1-4f4f-8a2c-9f261009aa2a)
13. Happy Upscayling 😄
![Screenshot from 2023-06-18 23-53-45](https://github.com/upscayl/upscayl/assets/25067102/29bdc308-711d-4599-b1b6-ed958440f374)
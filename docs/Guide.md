This is where you can find guides and tutorials for Upscayl. 

### HELP US EXTEND THIS LIST BY SUBMITTING SUGGESTIONS IN DA [ISSUES TAB](https://github.com/upscayl/upscayl/issues) 🙏🏻

## GPU ID
The GPU ID is used to manually specify a Vulkan enabled GPU to be used for upscaling images. According to the Real-ESRGAN documentation, you can use this option even for multi-GPUs.

To find out the GPU ID, follow these steps:
1. Open Upscayl and (try to) upscayl an image.
2. Go to the Settings tab and scroll down till you see the logs area.
3. You can now see all the GPU IDs available to you. As you can see from the image, 1 is Nvidia, 2 is llvmpipe and 0 is AMD Radeon.   
![image](https://github.com/upscayl/upscayl/assets/25067102/23aabc8d-9844-4366-b34b-e6eeb93385c7)
    * This screenshot is only an example. Actual ID values may vary.
4. Now in the 'GPU ID' input box, you can enter:  
`0`   
`1`   
`2`   
or even `0,1,2`
    * On Windows, this setting may be overridden by the system if Upscayl has not been [set to performance mode](https://youtube.com/watch?v=sxvs6qYHJmc) under advanced display settings.
    * This doesn't distribute the load evenly due to Real-ESRGAN shenanigans. See [#465](upscayl/upscayl/issues/465) for details.

## Logs
The logs appear in the Settings tab.   
<img src="https://github.com/upscayl/upscayl/assets/25067102/ae8975b9-39d3-43a7-8ab5-435b42a67e6e" height="500px" />

To copy a log, you can press the COPY button and paste it in the GitHub issue template for bug reports.

## Custom Models
Since Upscayl v2.5, you can load your own NCNN models into Upscayl. To convert models from PyTorch, see [🖥️ Model Conversion Guide](../%F0%9F%96%A5%EF%B8%8F-Model-Conversion-%E2%80%90-Create-more-AI-models!). You could also load Upscayl's official [Custom Models Repository](https://github.com/upscayl/custom-models).

To use your custom models, follow these steps:
1. Make a folder called "models".
2. Put your NCNN models (in .bin + .param format) into the "models" folder.
3. Open Upscayl.
4. Go to the Settings tab and scroll down until you see the "Add Custom Models" area and the "Select Folder" button.
5. Select the "models" folder you created in step 1.
6. Go to the Upscayl tab and select the Upscayling type to the filename of the custom model you want to use.

## Scale Option
Since v2.8, Upscayl emulates the scale option by Downscayling the x4 image for unsupported models.

Not all models support x1, x2 and x3; all the default models only support x4. To use other scales as native model output, you can get the compatible models from the [Custom Models Repository](https://github.com/upscayl/custom-models). For example, with the `realesr-animevideov3-x2` model, you can use the scale x2; with `realesr-animevideov3-x3`, you can use the scale x3.

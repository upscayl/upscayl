If you run into problems with Upscayl, here are a few ways to fix it.

> [!IMPORTANT]
> You'll need a Vulkan compatible GPU to upscale images. Many CPU and iGPUs do not work but no harm in trying.  
> Make sure to read [the FAQ](https://github.com/upscayl/upscayl#-faq) first to avoid getting rickrolled.

## General Fixes
- Uninstall and Reinstall the app.
- Restart your computer.
- Try setting your [GPU ID](https://github.com/upscayl/upscayl/wiki/Guide#gpu-id) to your discrete GPU.

## Linux Users
- Reinstall graphics drivers BUT Before doing that, run [VulkanCapsViewer](https://github.com/SaschaWillems/VulkanCapsViewer). If it reports Vulkan support, you might not need to do this.

## Mac Users
- Make sure you're using the latest MacOS update.
### If the app doesn't work, try deleting all its files and folders:

<img src="https://github.com/upscayl/upscayl/assets/25067102/22dab1e0-001f-4212-bb77-904fe36c9916" width="500px" />

1. Open Finder → Click **Go** in the menu bar → Select **Go to Folder** from the drop-down menu → In the window that appears, type **~/Library/** and press Enter. 

2. Here, in the Library folder, find and remove all files which contain 'Upscayl'. 
Here's a list of files and folders you can safely delete:
**NOTE: PLEASE DO NOT DELETE THE FOLDERS THAT DO NOT HAVE UPSCAYL IN THEIR NAME** 
- **~/Library/Application Support/Upscayl**
- **~/Library/Saved Application State/org.upscayl.Upscayl.savedState/**
- **~/Library/Group Containers/W2T4W74X87.org.upscayl.Upscayl**
- **~/Library/Containers/Upscayl** (and other folders named Upscayl)
- **~/Library/Preferences/org.upscayl.Upscayl.plist/**
- **~/Library/Preferences/org.upscayl.Upscayl.helper.plist/**

## Windows Users
- [Set the app to performance mode](https://youtube.com/watch?v=sxvs6qYHJmc) and make sure you have the right redistributables.
- Try [DirectX repair](http://blog.csdn.net/vbcom/article/details/6962388).
- [Disable switchable graphics](https://nvidia.custhelp.com/app/answers/detail/a_id/5182/~/unable-to-launch-vulkan-apps%2Fgame-on-notebooks-with-amd-radeon-igpus) if you can. (thanks @[JZeravik](https://github.com/JZeravik)!)
- [Enable hardware-accelerated GPU scheduling](https://www.howtogeek.com/756935/how-to-enable-hardware-accelerated-gpu-scheduling-in-windows-11) if you can.
- Reinstall graphics drivers BUT Before doing that, run [VulkanCapsViewer](https://github.com/SaschaWillems/VulkanCapsViewer). If it reports Vulkan support, you might not need to do this.

# If all of the above fail, [Please click here to know how you can ask for help](https://github.com/upscayl/upscayl/wiki/%F0%9F%99%8B-How-to-ask-for-help%3F).
<p align="center">
  <img src="https://github.com/razvanilin/umaster-client/raw/master/client/app/images/logo-color.png" width="120"/>
</p>

# uMaster PC Client
uMaster is a PC applications that allows you to use predefined scripts to create activities on your computer. These activities can be activated remotely through a web and mobile application (the later not yet implemented).

**Actively developing on OS X and Windows, Linux builds will not appear that often in the alpha stage**

* The web app can be found at: [umaster.xyz](http://umaster.xyz) where you can activate ativities on your PC
* The PC client can be found [here](https://github.com/razvanilin/umaster-client/releases). The PC activities are created there


# Wait, what?
The predefined scripts are included in the distribution of the software and these can be:

* **Lock script**: Allows you to create a lock activity that can be activated remotely (e.g. your phone)
* **Open App script**: Let's you choose what app you want to open on your PC (e.g. Spotify)
* **Open URL script**: Choose what URL you want to open in the default browser (e.g. your favorite YouTube playlist)

The above scripts are used for the development at the moment, but a lot of other ideas can be implemented. The configuration of the scripts is done in the `scriptsConf.json` file and it will allow easy plug-and-play for your own scripts. [Check the wiki](https://github.com/razvanilin/uMaster/wiki/Register-activities) for more information about this.

# Is that even secure?
I'm still working on improving the security of the app, but yes, it is quite secure. The authentication is currently done through Google and Facebook oauth2 and the activity requests are done through sockets which are checked on a central server.

The scripts cannot be written or plugged in remotely through the apps, so nobody can write a script to cause any damage to your PC. The plan is to have a repository of scripts that can be selected by the users.

**This app is in the early development stage so expect many bugs along the way**

You can help by [opening new issues](https://github.com/razvanilin/umaster-web/issues) about any problems you encounter or any improvements you might think of.

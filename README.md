# fontbrowser

View and organize fonts on your desktop. Windows, Mac, and Linux. Open source and free forever, no restrictions. Finds all installed system fonts automatically, with the option to add your own font folders. View all glyphs for any font on demand. Option to view fonts with ANY OpenType features implemented by any font you have installed toggled on or off. Will that do anything? That's for you to find out! Tags and tag search are now implemented; please use them responsibly.

New feature: font pinning! Pin any number of individual fonts to the top of the font list. They'll remain there until you unpin them, even if you search for something else.

# disclaimer

Releases should all be runnable on all 3 platforms but I mostly have only been testing on ~~Windows~~ Linux. You won't mess up your computer by running this thing, but it also might not work! (If it doesn't work, I'd appreciate it if you hop over to the Issues or Discussions tab on this project's github page, and describe for me what happened instead of it working.) Also, I have never used electron, react, or typescript (the main technologies this program relies on) before starting this project, so if you actually know what you're doing around those and you look at my code, have mercy on me.

# note on origins

This program was created in dialogue with members of the [renegade bindery](https://renegadepublishing.carrd.co/) discord server, and as such is presented in the spirit of the [fannish gift economy](https://fanlore.org/wiki/Gift_Economy).

# known issues

The zoom in keyboard shortcut listed in the "View" menu doesn't work unless you also press the shift key. This is apparently a known electron issue that they have never fixed for some reason. I'm looking in to a workaround.

The button to save your search settings as default doesn't give any feedback that it worked.

On linux only, if you have a font file with a mixed-case file extension (like .Ttf instead of either .TTF or .ttf) that font will not be included in the font list.

# ok that's great but how do I download it

Click on the latest release in the right-hand sidebar and download the correct file for your OS:

- Windows: the one that ends with .exe
- Mac: the one that has "darwin" in the name
- Linux (Debian-based distros): the one that ends with .deb
- Linux (Redhat-based distros): the one that ends with .rpm

From there you should be able to run the program by double-clicking on the downloaded file. You'll probably have to jump through some hoops to convince your OS that yes you really want to run it yes you know it's an unknown publisher GOD MOM I KNOW WHAT I'M DOING OKAY!

# ok that's great but what does it look like

By popular demand (one person) here are some screenshots.

You can search by both font name and included characters (plus your own custom tags)

![search with emoji](/screenshots/emoji.png)

You can add font folders and switch between light and dark mode

![lightmode settings](/screenshots/settings.png)

You can toggle OpenType features of fonts on or off (feature states beyond on and off not yet supported)

![features](/screenshots/features.png)

# Clean up any unreleased virtual frame buffer instances and prepare the new one

if [ -f /tmp/.X9-lock ]; then
  rm /tmp/.X9-lock
fi

if [ "$FONT_ZIP_URLS" = "" ]
then
   echo "To use custom fonts in this environment, please define the FONT_ZIP_URL environment variable"
else
   echo "Installing custom fonts..."
   for url in $( echo $FONT_ZIP_URLS | tr " " "\n"); do
     echo "Initiating download from $url.. This may take a few minutes to unzip and install"
     wget -O /tmp/fontzip.$$ $url && unzip -o /tmp/fontzip.$$ -d /usr/share/fonts && fc-cache -f -v
     echo "Downloaded and installed fonts from $url"
   done
   echo "Custom font installation completed"
fi

umount /dev/shm
mount -t tmpfs -o rw,nosuid,nodev,noexec,relatime,size=1G tmpfs /dev/shm

# Create new virtual frame buffer with X-Window environment
Xvfb -ac -screen scrn 1280x960x24 :9.0 &
export DISPLAY=:9.0

# Start the Node-Express microservice
ELECTRON_ENABLE_LOGGING=true ELECTRON_ENABLE_STACK_DUMPING=true DEBUG=* npm start

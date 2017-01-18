# Clean up any unreleased virtual frame buffer instances and prepare the new one

if [ -f /tmp/.X9-lock ]; then
  rm /tmp/.X9-lock
fi

umount /dev/shm
mount -t tmpfs -o rw,nosuid,nodev,noexec,relatime,size=1G tmpfs /dev/shm

# Create new virtual frame buffer with X-Window environment
Xvfb -ac -screen scrn 1280x960x24 :9.0 &
export DISPLAY=:9.0

# Start the Node-Express microservice
ELECTRON_ENABLE_LOGGING=true ELECTRON_ENABLE_STACK_DUMPING=true DEBUG=* npm start

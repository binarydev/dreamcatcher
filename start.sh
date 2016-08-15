# Clean up any unreleased virtual frame buffer instances and prepare the new one
rm /tmp/.X9-lock

# Create new virtual frame buffer with X-Window environment
Xvfb -ac -screen scrn 1280x960x24 :9.0 &
export DISPLAY=:9.0

# Start the Node-Express microservice
npm start
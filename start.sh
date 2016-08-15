# Clean up any unreleased virtual frame buffer instances and prepare the new one
rm /tmp/.X9-lock
Xvfb -ac -screen scrn 1280x960x24 :9.0 &
export DISPLAY=:9.0
npm start
import sys, os
import uvicorn

curr_dir = os.path.dirname(os.path.abspath(__file__))
if curr_dir not in sys.path:
    sys.path.insert(0, curr_dir)

import main

if __name__ == "__main__":
    uvicorn.run(main.app, host="0.0.0.0", port=8001, log_level="info")

from CommLib.CircularList import CircularList
from CommLib.QuaternionFilter import QuaternionFilter
from time import sleep
import asyncio
from bleak import BleakClient, BleakScanner

# Replace these with your device's address and characteristic UUIDs
DEVICE_ADDRESS = "F8:4E:17:BE:C3:1A"
CHARACTERISTIC_UUID = "0000xxxx-0000-1000-8000-00805f9b34fb"

async def main():
    async with BleakClient(DEVICE_ADDRESS) as client:
        num_samples = 250
        refresh_time = 0.1
        times = CircularList([], num_samples)
        ax = CircularList([], num_samples)
        ay = CircularList([], num_samples)
        az = CircularList([], num_samples)
        gx = CircularList([], num_samples)
        gy = CircularList([], num_samples)
        gz = CircularList([], num_samples)
        mx = CircularList([], num_samples)
        my = CircularList([], num_samples)
        mz = CircularList([], num_samples)
        temperature = CircularList([], num_samples)
        quat_filter = QuaternionFilter()

        def notification_handler(sender, data):
            try:
                message = data.decode('utf-8')
                parts = message.split(',')
                if len(parts) == 10:
                    parts = [part.strip() for part in parts]
                    (ax_value, ay_value, az_value,
                     gx_value, gy_value, gz_value,
                     mx_value, my_value, mz_value,
                     temperature_value) = map(float, parts)
                    
                    quat_filter.update(ax_value, ay_value, az_value, gx_value, gy_value, gz_value, mx_value, my_value, mz_value)
                    ax.add(ax_value)
                    ay.add(ay_value)
                    az.add(az_value)
                    gx.add(gx_value)
                    gy.add(gy_value)
                    gz.add(gz_value)
                    mx.add(mx_value)
                    my.add(my_value)
                    mz.add(mz_value)
                    temperature.add(temperature_value)
                    
                    if ax_value < -2.0 and ay_value < 0.5 and az_value > 9.0:
                        print("Harsh braking detected!")
                        
                    if ax_value > 2.0:
                        print("Harsh acceleration detected!")
                        
                    if abs(gy_value) > 2.0:  
                        print("Harsh turning detected!")
                    
                    if az_value < -9.0:
                        print("Car flipped detected")
            except Exception as e:
                print("Error processing data:", e)
        
        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)
        print("Receiving data... Press Ctrl+C to exit")
        
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            await client.stop_notify(CHARACTERISTIC_UUID)
            print("Stopped receiving data")

if __name__ == "__main__":
    asyncio.run(main())

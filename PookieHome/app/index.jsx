import {StatusBar} from 'expo-status-bar';
import {Alert, Text, View} from 'react-native';
import {Link} from 'expo-router';
import useBLE from '../useBLE';
import CustomButton from '../components/Custom Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
    const {
        requestPermissions,
        scanForPeripherals,
        allDevices,
        // connectToDevice,
        // connectedDevice,
        // disconnectFromDevice,
    } = useBLE();

    const scanForDevices = async () => {
        const isPermissionsEnabled = await requestPermissions();
        if (isPermissionsEnabled) {
            console.log("permissions enabled");
            scanForPeripherals();
        }
    };

    return (
        <SafeAreaView className="bg-pastel-blue h-full">
            <View className="flex-1 items-center justify-center bg-primary">
                <Text className = "font-pblack text-3xl">pookie</Text>
                <StatusBar style = "auto"/>
                <Link href = "/profile" style = {{color: 'blue'}}>Go to Profile</Link>
                <Link href = "/home" style = {{color: 'blue'}}>Go to Home</Link>
                <Link href = "/(tabs)/your-pookie" style = {{color: 'blue'}}>Go to Your Pookie</Link>
            </View>
            <CustomButton
                title="Connect to Bluetooth Device"
                handlePress={scanForDevices}
                containerStyles="bg-black"
            />
        </SafeAreaView>
        
    );
}

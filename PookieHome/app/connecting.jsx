import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useBluetooth } from '../BluetoothContext';
import CustomButton from '../components/Custom Button';

const BluetoothConnection = () => {
    const {
        requestPermissions,
        scanForPeripherals,
        allDevices,
        connectToDevice,
        connectedDevice,
        disconnectFromDevice,
    } = useBluetooth();

    useEffect(() => {
        const startScan = async () => {
            const isPermissionsEnabled = await requestPermissions();
            if (!isPermissionsEnabled) {
                console.error("permissions not enabled");
                return;
            }
            console.log("permissions enabled");
            console.log("scanning for devices");
            scanForPeripherals();
        };
        startScan();
    }, []);

    const handleConnect = async (device) => {
        console.log("Connecting to device:", device.id);
        await connectToDevice(device);
        // wait for connection to complete
        while (!connectedDevice) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log("Connected to device:", connectedDevice.id);
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.deviceItem} onPress={() => handleConnect(item)}>
            <Text>Device Name: {item.name}</Text>
            <Text>Device ID: {item.id}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text>Available Bluetooth Devices:</Text>
            <FlatList
                data={allDevices}
                renderItem={renderItem}
            />
            <CustomButton
                title="Rescan for Devices"
                handlePress={scanForPeripherals}
                containerStyles="bg-black"
            />
        </View>
    );
};

export default BluetoothConnection;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
});
import {View, Text, ScrollView, Alert} from 'react-native';
import {useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {Link, router} from "expo-router"

import FormField from "../../components/FormField";
import CustomButton from "../../components/Custom Button";

import * as SecureStore from "expo-secure-store";

const loginUser = async (email, password) => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/user/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
    });
    if (!response.ok) {
        throw new Error("An error occurred while signing in");
    }
    return await response.json();
}

const SignIn = () => {
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async () => {
        if (form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setIsSubmitting(true);
        try {
            let result = await loginUser(form.email, form.password);
            // login result should have {"access_token": access_token, "token_type": "bearer"}
            let token = result.access_token;
            // store
            await SecureStore.setItemAsync("token", token);
            console.log("token stored: ", await SecureStore.getItemAsync("token"));
            Alert.alert("Success", "You have successfully logged in");
            router.navigate("/profile");
        }
        catch (error) {
            Alert.alert("Error", error.message);
        }
        finally {
            setIsSubmitting(false);
        }
    }


    return (
        <SafeAreaView className={"bg-amber-300 h-full"}>
            <ScrollView>
                <View className="w-full justify-center h-full px-4">
                    <Text className={"text-3xl font-pbold text-blue-800"}>Log In to Pookie:</Text>

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Sign In"
                        handlePress={submit}
                        containerStyles="bg-pastel-blue mt-7"
                        textStyles="text-white"
                        isLoading={isSubmitting}
                    />

                    <View className={"justify-center pt-5 flex-row gap-2"}>
                        <Text className="text-lg text-black">
                            Don't have an account?
                        </Text>
                        <Link href="/sign-up" className="text-lg text-blue-950 font-semibold ">Sign Up</Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn;
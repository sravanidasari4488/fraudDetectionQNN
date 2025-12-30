import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, StatusBar, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';

//  api imports
import { sendOtp } from '../../../services/api/otp.api.js';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidHideListener?.remove();
            keyboardDidShowListener?.remove();
        };
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError('');
    };

    const handleSignIn = async () => {
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            
            await sendOtp(email);
            router.push({ pathname: '/auth/magic-link-sent', params: { email: email } });
        } catch (err) {
            setError('Failed to send email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {!keyboardVisible && <SignInHeader />}
            <SignInIllustration />
            <SignInForm 
                email={email}
                error={error}
                onEmailChange={handleEmailChange}
                onSignIn={handleSignIn}
                loading={isLoading}
            />
            <SignInFooter />
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
};
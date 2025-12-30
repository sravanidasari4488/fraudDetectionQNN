import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import OTPButton from '../../../components/OTP/OTPButton';
import OTPDisplay from '../../../components/OTP/OTPDisplay';
import OTPHeader from '../../../components/OTP/OTPHeader';
import OTPResend from '../../../components/OTP/OTPResend';

import { sendOtp, verifyOtp } from '../../../services/api/otp.api.js';

export default function OTP() {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(39);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputRef = useRef(null);

  const { phone } = useLocalSearchParams();

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 100);
    
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    

    return () => {
      clearInterval(timer);
      clearTimeout(focusTimeout);
    };
  }, []);

  const handleSubmit = async () => {
    if (otp.length === 4 && phone) {
      setIsLoading(true);
      try {
        const data = await verifyOtp(phone, otp);
        router.replace('/auth/loading');
      } catch (err) {
        // Optionally show error to user
      }finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(cleanedText);
    setActiveIndex(cleanedText.length < 4 ? cleanedText.length : 3);
    
    if (cleanedText.length === 4) {
      setTimeout(() => {
        handleSubmit();
      }, 300);
    }
  };

  const handleResend = async () => {
    if (countdown === 0 && phone) {
      try {
        await sendOtp(phone);
        setCountdown(39);
      } catch (err) {
        // Optionally show error to user
      }
    }
  };

  return (
    <View style={styles.container}>
      <OTPHeader />
      
      <View style={styles.content}>
        <OTPDisplay 
          otp={otp}
          activeIndex={activeIndex}
          inputRef={otpInputRef}
          onOtpChange={handleOtpChange}
        />
        
        <OTPResend 
          countdown={countdown}
          onResend={handleResend}
        />
        
        <OTPButton 
          otpLength={otp.length}
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
};
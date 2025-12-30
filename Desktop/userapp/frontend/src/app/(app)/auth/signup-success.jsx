import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import SuccessIndicator from '../../../components/common/SuccessIndicator';
import SuccessHeader from '../../../components/SignUpSuccess/SuccessHeader';
import SuccessIllustration from '../../../components/SignUpSuccess/SuccessIllustration';
import SuccessMessage from '../../../components/SignUpSuccess/SuccessMessage';
import SuccessWelcome from '../../../components/SignUpSuccess/SuccessWelcome';
import { useAppStates } from '../../../context/AppStates';

export default function SignupSuccess() {
  const { markProfileCompleted } = useAppStates();
  const [currentStep, setCurrentStep] = useState('success'); // 'success', 'welcome'

  const handleContinue = () => {
    setCurrentStep('welcome');
  };

  const handleComplete = async () => {
    // Mark profile as completed
    await markProfileCompleted();
    // Navigate to home
    router.replace('/(app)/protected/(tabs)/Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SuccessHeader />
        <SuccessIllustration />
        
        {currentStep === 'success' && (
          <>
            <SuccessIndicator 
              title="Account Created!"
              subtitle="Welcome to our service platform"
              message="Your account has been successfully created and verified"
            />
            <SuccessMessage onContinue={handleContinue} />
          </>
        )}
        
        {currentStep === 'welcome' && (
          <SuccessWelcome onComplete={handleComplete} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSetupScreen() {
  const { isNewUser = true } = useLocalSearchParams<{
    isNewUser?: string;
  }>();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, _setProfileImage] = useState<string | null>(null);
  
  const { user, updateUser } = useAuth();

  const handleSkip = () => {
    // User can skip profile setup and go to main app
    router.replace('/(app)/(tabs)/chats');
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    if (displayName.length > 50) {
      Alert.alert('Error', 'Display name must be 50 characters or less');
      return;
    }

    if (bio.length > 160) {
      Alert.alert('Error', 'Bio must be 160 characters or less');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to update user profile
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user in context
      if (user) {
        const updatedUser = {
          ...user,
          status: 'active' as const,
        };
        updateUser(updatedUser);
      }

      // Navigate to main app
      router.replace('/(app)/(tabs)/chats');
      
    } catch (_error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker
    Alert.alert('Image Picker', 'Image picker functionality will be implemented next');
  };

  const isUpdate = isNewUser === 'false';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isUpdate ? 'Update Profile' : 'Set Up Your Profile'}
        </Text>
        <Text style={styles.subtitle}>
          {isUpdate 
            ? 'Update your profile information'
            : 'Tell us a bit about yourself'
          }
        </Text>

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Pressable style={styles.imageButton} onPress={handleImagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📷</Text>
                <Text style={styles.imageButtonText}>Add Photo</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Display Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your display name"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={50}
            editable={!isLoading}
            autoCapitalize="words"
          />
          <Text style={styles.characterCount}>
            {displayName.length}/50
          </Text>
        </View>

        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            value={bio}
            onChangeText={setBio}
            maxLength={160}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
          <Text style={styles.characterCount}>
            {bio.length}/160
          </Text>
        </View>

        {/* Contact Info Display */}
        {user && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>
              {user.phone ? 'Phone' : 'Email'}:
            </Text>
            <Text style={styles.contactValue}>
              {user.phone || user.email}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Saving...' : (isUpdate ? 'Update Profile' : 'Complete Setup')}
            </Text>
          </Pressable>

          {!isUpdate && (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 24,
    marginBottom: 4,
  },
  imageButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  contactInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
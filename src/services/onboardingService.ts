import { supabase } from '../lib/supabase';
import type { OnboardingData } from '../components/Onboarding';

export async function checkPhoneNumberExists(phoneNumber: string, countryCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .eq('country_code', countryCode)
      .maybeSingle();

    if (error) {
      console.error('Error checking phone number:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking phone number:', error);
    return false;
  }
}

export async function saveOnboardingData(data: OnboardingData) {
  try {
    if (data.registrationType === 'myself') {
      return await saveMyselfRegistration(data);
    } else if (data.registrationType === 'loved-one') {
      return await saveLovedOneRegistration(data);
    } else {
      throw new Error('Invalid registration type');
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    throw error;
  }
}

async function saveMyselfRegistration(data: OnboardingData) {
  const email = `${data.phoneNumber}@aasha-temp.com`;
  const password = generateTemporaryPassword(data.phoneNumber);

  let userId: string;
  let isExistingAuth = false;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', data.phoneNumber)
    .eq('country_code', data.countryCode)
    .maybeSingle();

  if (existingProfile) {
    throw new Error('User already registered');
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        phone: `${data.countryCode}${data.phoneNumber}`,
      }
    }
  });

  if (signUpError) {
    console.error('Signup error:', signUpError);
    if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
      try {
        await cleanupOrphanedAuth(data.phoneNumber, data.countryCode);
        const retryAuth = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              phone: `${data.countryCode}${data.phoneNumber}`,
            }
          }
        });

        if (retryAuth.error) {
          throw new Error('Failed to create account after cleanup');
        }
        if (!retryAuth.data.user) throw new Error('User creation failed');
        userId = retryAuth.data.user.id;

        if (!retryAuth.data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            throw new Error(`Failed to authenticate: ${signInError.message}`);
          }
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
        throw new Error('This phone number has a partial registration. Please try again in a few moments.');
      }
    } else {
      throw new Error(`Failed to create account: ${signUpError.message}`);
    }
  } else {
    if (!authData.user) throw new Error('User creation failed');
    userId = authData.user.id;

    if (!authData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error after signup:', signInError);
        throw new Error(`Failed to authenticate: ${signInError.message}`);
      }
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      phone_number: data.phoneNumber,
      country_code: data.countryCode,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      language: data.language,
      marital_status: data.maritalStatus,
      registration_type: 'myself',
    })
    .select()
    .single();

  if (profileError) {
    console.error('Profile insert error:', profileError);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  const callTimePreference = mapCallTimeToPreference(data.callTime, data.customTimeRange);

  const { data: elderlyProfile, error: elderlyError } = await supabase
    .from('elderly_profiles')
    .insert({
      profile_id: userId,
      caregiver_profile_id: null,
      phone_number: data.phoneNumber,
      country_code: data.countryCode,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      language: data.language,
      marital_status: data.maritalStatus,
      call_time_preference: callTimePreference,
      relationship_to_caregiver: null,
    })
    .select()
    .single();

  if (elderlyError) {
    console.error('Elderly profile insert error:', elderlyError);
    throw new Error(`Failed to create elderly profile: ${elderlyError.message}`);
  }

  await saveMedications(elderlyProfile.id, data.medications);
  await saveInterests(elderlyProfile.id, data.interests);

  const result = { userId, profileId: profile.id, elderlyProfileId: elderlyProfile.id };

  await sendWebhook({
    ...result,
    registrationType: 'myself',
    phoneNumber: data.phoneNumber,
    countryCode: data.countryCode,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    language: data.language,
    maritalStatus: data.maritalStatus,
    callTimePreference: callTimePreference,
    medications: data.medications,
    interests: data.interests,
  });

  return result;
}

async function saveLovedOneRegistration(data: OnboardingData) {
  const email = `${data.phoneNumber}@aasha-temp.com`;
  const password = generateTemporaryPassword(data.phoneNumber);

  let caregiverId: string;

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', data.phoneNumber)
    .eq('country_code', data.countryCode)
    .maybeSingle();

  if (existingProfile) {
    throw new Error('User already registered');
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        phone: `${data.countryCode}${data.phoneNumber}`,
      }
    }
  });

  if (signUpError) {
    console.error('Signup error:', signUpError);
    if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
      try {
        await cleanupOrphanedAuth(data.phoneNumber, data.countryCode);
        const retryAuth = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              phone: `${data.countryCode}${data.phoneNumber}`,
            }
          }
        });

        if (retryAuth.error) {
          throw new Error('Failed to create account after cleanup');
        }
        if (!retryAuth.data.user) throw new Error('User creation failed');
        caregiverId = retryAuth.data.user.id;

        if (!retryAuth.data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            throw new Error(`Failed to authenticate: ${signInError.message}`);
          }
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
        throw new Error('This phone number has a partial registration. Please try again in a few moments.');
      }
    } else {
      throw new Error(`Failed to create account: ${signUpError.message}`);
    }
  } else {
    if (!authData.user) throw new Error('User creation failed');
    caregiverId = authData.user.id;

    if (!authData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error after signup:', signInError);
        throw new Error(`Failed to authenticate: ${signInError.message}`);
      }
    }
  }

  const { data: caregiverProfile, error: caregiverError } = await supabase
    .from('profiles')
    .insert({
      id: caregiverId,
      phone_number: data.phoneNumber,
      country_code: data.countryCode,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      language: data.language,
      marital_status: data.maritalStatus,
      registration_type: 'loved-one',
    })
    .select()
    .single();

  if (caregiverError) {
    console.error('Caregiver profile insert error:', caregiverError);
    throw new Error(`Failed to create caregiver profile: ${caregiverError.message}`);
  }

  const callTimePreference = mapCallTimeToPreference(data.callTime, data.customTimeRange);

  const { data: elderlyProfile, error: elderlyError } = await supabase
    .from('elderly_profiles')
    .insert({
      profile_id: null,
      caregiver_profile_id: caregiverId,
      phone_number: data.lovedOnePhoneNumber!,
      country_code: data.lovedOneCountryCode!,
      first_name: data.lovedOneFirstName!,
      last_name: data.lovedOneLastName!,
      date_of_birth: data.lovedOneDateOfBirth!,
      gender: data.lovedOneGender!,
      language: data.lovedOneLanguage!,
      marital_status: data.lovedOneMaritalStatus!,
      call_time_preference: callTimePreference,
      relationship_to_caregiver: data.relationship!,
    })
    .select()
    .single();

  if (elderlyError) {
    console.error('Elderly profile insert error (loved-one):', elderlyError);
    throw new Error(`Failed to create elderly profile: ${elderlyError.message}`);
  }

  await saveMedications(elderlyProfile.id, data.medications);
  await saveInterests(elderlyProfile.id, data.interests);

  const result = { userId: caregiverId, profileId: caregiverProfile.id, elderlyProfileId: elderlyProfile.id };

  await sendWebhook({
    ...result,
    registrationType: 'loved-one',
    phoneNumber: data.phoneNumber,
    countryCode: data.countryCode,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    language: data.language,
    maritalStatus: data.maritalStatus,
    callTimePreference: callTimePreference,
    medications: data.medications,
    interests: data.interests,
    lovedOne: {
      phoneNumber: data.lovedOnePhoneNumber!,
      countryCode: data.lovedOneCountryCode!,
      firstName: data.lovedOneFirstName!,
      lastName: data.lovedOneLastName!,
      dateOfBirth: data.lovedOneDateOfBirth!,
      gender: data.lovedOneGender!,
      language: data.lovedOneLanguage!,
      maritalStatus: data.lovedOneMaritalStatus!,
      relationship: data.relationship!,
    },
  });

  return result;
}

async function saveMedications(elderlyProfileId: string, medications: OnboardingData['medications']) {
  if (medications.length === 0) return;

  const medicationsToInsert = medications.map(med => ({
    elderly_profile_id: elderlyProfileId,
    name: med.name,
    dosage_quantity: med.dosage_quantity,
    times_of_day: med.times_of_day,
  }));

  const { error } = await supabase
    .from('medications')
    .insert(medicationsToInsert);

  if (error) {
    console.error('Medications insert error:', error);
    throw new Error(`Failed to save medications: ${error.message}`);
  }
}

async function saveInterests(elderlyProfileId: string, interests: string[]) {
  if (interests.length === 0) return;

  const interestsToInsert = interests.map(interest => ({
    elderly_profile_id: elderlyProfileId,
    interest,
  }));

  const { error } = await supabase
    .from('interests')
    .insert(interestsToInsert);

  if (error) {
    console.error('Interests insert error:', error);
    throw new Error(`Failed to save interests: ${error.message}`);
  }
}

function mapCallTimeToPreference(
  callTime: string,
  customTimeRange?: { start: string; end: string }
): 'morning' | 'afternoon' | 'evening' {
  if (callTime === 'morning') return 'morning';
  if (callTime === 'afternoon') return 'afternoon';
  if (callTime === 'evening') return 'evening';

  if (callTime === 'custom' && customTimeRange) {
    const startHour = parseInt(customTimeRange.start.split(':')[0]);
    if (startHour >= 6 && startHour < 12) return 'morning';
    if (startHour >= 12 && startHour < 17) return 'afternoon';
    return 'evening';
  }

  return 'afternoon';
}

function generateTemporaryPassword(phoneNumber: string): string {
  const hash = phoneNumber.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `aasha_${Math.abs(hash)}_${phoneNumber.slice(-4)}_temp_pw_2025`;
}

async function cleanupOrphanedAuth(phoneNumber: string, countryCode: string) {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cleanup-orphaned-auth`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, countryCode }),
    });

    if (!response.ok) {
      console.error('Cleanup function failed:', await response.text());
      throw new Error('Failed to cleanup orphaned auth user');
    }

    const result = await response.json();
    console.log('Cleanup result:', result);
    return result;
  } catch (error) {
    console.error('Error calling cleanup function:', error);
    throw error;
  }
}

async function sendWebhook(data: any) {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-registration-webhook`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('Webhook call failed:', await response.text());
    }
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
}

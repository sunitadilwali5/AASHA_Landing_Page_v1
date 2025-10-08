import { supabase } from '../lib/supabase';
import type { OnboardingData } from '../components/Onboarding';

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
  const password = generateTemporaryPassword();

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
    throw new Error(`Failed to create account: ${signUpError.message}`);
  }
  if (!authData.user) throw new Error('User creation failed');

  const userId = authData.user.id;

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
  const password = generateTemporaryPassword();

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
    throw new Error(`Failed to create account: ${signUpError.message}`);
  }
  if (!authData.user) throw new Error('User creation failed');

  const caregiverId = authData.user.id;

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
    dosage: med.dosage,
    frequency: med.frequency,
    time: med.time,
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

function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
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

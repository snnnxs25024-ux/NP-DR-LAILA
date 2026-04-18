import { supabase } from './supabase';

export async function uploadAthleteImage(file: File, athleteId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    // Use an absolutely flat path on the root of the bucket
    const fileName = `${athleteId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('profile')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadAthleteImage:', error);
    return null;
  }
}

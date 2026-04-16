import { supabase } from './supabase';

export async function uploadAthleteImage(file: File, athleteId: string): Promise<string | null> {
  try {
    // Ensure bucket exists (this might fail if not admin, but we try)
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === 'athletes')) {
        await supabase.storage.createBucket('athletes', { public: true });
      }
    } catch (e) {
      console.warn('Could not verify/create bucket:', e);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${athleteId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('athletes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('athletes')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadAthleteImage:', error);
    return null;
  }
}

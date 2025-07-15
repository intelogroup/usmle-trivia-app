import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bkuowoowlmwranfoliea.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdW93b293bG13cmFuZm9saWVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDIwMDg1NCwiZXhwIjoyMDY1Nzc2ODU0fQ.V1-SQLXxMeMj6P638-gRpU3i38m2CqYdT2C8nLubLpc'
);

async function checkTagsStructure() {
  console.log('🔍 Checking tags table structure...');
  
  // Get sample tags to see the structure
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('type', 'subject')
    .limit(3);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Sample subject tags:');
  tags.forEach(tag => {
    console.log(`  - ID: ${tag.id}, Name: ${tag.name}, Slug: ${tag.slug}`);
  });
  
  // Check if there are any systems with parent_id
  const { data: systems, error: systemsError } = await supabase
    .from('tags')
    .select('*')
    .eq('type', 'system')
    .limit(3);
  
  if (!systemsError && systems.length > 0) {
    console.log('\n📊 Sample system tags:');
    systems.forEach(system => {
      console.log(`  - ID: ${system.id}, Name: ${system.name}, Parent: ${system.parent_id}`);
    });
  } else {
    console.log('\n⚠️ No system tags found or error:', systemsError?.message);
  }
  
  // Check what happens when we try to find systems for cardiology
  console.log('\n🔍 Testing cardiology systems lookup...');
  
  // First, get the cardiology tag ID
  const { data: cardiologyTag, error: cardError } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', 'cardiology')
    .eq('type', 'subject')
    .single();
  
  if (cardError) {
    console.log('❌ Error finding cardiology tag:', cardError.message);
  } else {
    console.log(`✅ Found cardiology tag: ID=${cardiologyTag.id}, Name=${cardiologyTag.name}`);
    
    // Now try to find systems for this ID
    const { data: cardiologySystems, error: cardSystemsError } = await supabase
      .from('tags')
      .select('id, name, slug')
      .eq('type', 'system')
      .eq('parent_id', cardiologyTag.id)
      .eq('is_active', true);
    
    if (cardSystemsError) {
      console.log('❌ Error finding cardiology systems:', cardSystemsError.message);
    } else {
      console.log(`✅ Found ${cardiologySystems.length} cardiology systems:`, cardiologySystems);
    }
  }
}

checkTagsStructure().catch(console.error);

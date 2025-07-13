import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function getAllTags() {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest', '--project-ref=bkuowoowlmwranfoliea', '--read-only'],
    shell: true,
    env: {
      SUPABASE_ACCESS_TOKEN: 'sbp_0323f6c04769a3d0229d282036f7b34481b59d33',
    },
  });

  const client = new Client({
    name: 'get-tags-client',
    version: '1.0.0',
  });

  try {
    await client.connect(transport);
    
    // Get all tags
    const result = await client.callTool({
      name: 'execute_sql',
      arguments: { 
        query: 'SELECT id, name, type, is_active FROM tags WHERE is_active = true ORDER BY name;'
      },
    });
    
    console.log('📋 All available tags:');
    const data = result.content[0].text;
    const jsonMatch = data.match(/<untrusted-data-[^>]+>(.*?)<\/untrusted-data-[^>]+>/s);
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[1]);
      console.log(JSON.stringify(tags, null, 2));
      
      console.log('\n🏷️ Tag summary:');
      const byType = tags.reduce((acc, tag) => {
        acc[tag.type] = (acc[tag.type] || 0) + 1;
        return acc;
      }, {});
      console.log(byType);
    }

    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

getAllTags();
// Teste rápido da API de indicações
const API_BASE = 'https://api.artepuradesign.com.br';

// Token de teste (substituir pelo token válido)
const testToken = '7e72aa3c3b2b579fb039cd78891dc489a7af19ac2c77b618f097c1a63cc59413';

async function testReferralAPI() {
    console.log('🧪 Testando API de Indicações...');
    
    try {
        const response = await fetch(`${API_BASE}/referrals`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testToken}`
            }
        });
        
        console.log('📡 Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2));
        } else {
            const error = await response.text();
            console.log('❌ Erro:', error);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
}

// Executar teste
testReferralAPI();
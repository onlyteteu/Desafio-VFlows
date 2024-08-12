//TABELA PRODUTO 

const tabelaProdutos = document.getElementById('tabelaProdutos');
const adicionarLinhaBtn = document.getElementById('adicionarLinha');

adicionarLinhaBtn.addEventListener('click', () => {
    const novaLinhaDescricao = tabelaProdutos.querySelector('tbody tr:nth-child(odd)').cloneNode(true);
    const novaLinhaCampos = tabelaProdutos.querySelector('tbody tr:nth-child(even)').cloneNode(true);

    novaLinhaDescricao.querySelector('input').value = '';
    novaLinhaCampos.querySelectorAll('input, select').forEach(input => input.value = '');

    tabelaProdutos.querySelector('tbody').appendChild(novaLinhaDescricao);
    tabelaProdutos.querySelector('tbody').appendChild(novaLinhaCampos);

    attachEventListenersToNewRow(novaLinhaCampos);
});

tabelaProdutos.addEventListener('click', (event) => {
    if (event.target.classList.contains('removerLinha')) {
        const linha = event.target.closest('tr');
        const proximaLinha = linha.nextElementSibling;

        if (tabelaProdutos.querySelectorAll('tbody tr').length > 2) { 
            linha.remove();
            proximaLinha.remove();
        } else {
            alert('Você deve ter pelo menos um produto na tabela.');
        }
    }
});

tabelaProdutos.addEventListener('input', (event) => {
    if (event.target.name.startsWith('quantidadeEstoque') || event.target.name.startsWith('valorUnitario')) {
        const linha = event.target.closest('tr');
        const quantidade = parseFloat(linha.querySelector('input[name^="quantidadeEstoque"]').value) || 0;
        const valorUnitario = parseFloat(linha.querySelector('input[name^="valorUnitario"]').value) || 0;
        const valorTotal = quantidade * valorUnitario;
        linha.querySelector('input[name^="valorTotal"]').value = valorTotal.toFixed(2);
    }
});

function attachEventListenersToNewRow(linhaCampos) {
    linhaCampos.addEventListener('input', (event) => {
        if (event.target.name.startsWith('quantidadeEstoque') || event.target.name.startsWith('valorUnitario')) {
            calcularValorTotalNaLinha(event.target);
        }
    });

    const botaoRemover = linhaCampos.querySelector('.removerLinha');
    botaoRemover.addEventListener('click', () => {
        const linhaDescricao = linhaCampos.previousElementSibling; 

        if (tabelaProdutos.querySelectorAll('tbody tr').length > 2) { 
            linhaDescricao.remove();
            linhaCampos.remove(); 
        } else {
            alert('Você deve ter pelo menos um produto na tabela.');
        }
    });
}

attachEventListenersToNewRow(tabelaProdutos.querySelector('tbody tr:nth-child(even)'));


//TABELA ANEXOS


const tabelaAnexos = document.getElementById('tabelaAnexos');
const adicionarAnexoBtn = document.getElementById('adicionarAnexo');

function attachEventListenersToAnexoRow(linha) {
    const botaoRemover = linha.querySelector('.removerAnexo');
    const botaoVisualizar = linha.querySelector('.visualizarAnexo');
    const inputFile = linha.querySelector('input[type="file"]');
    const fileNameSpan = linha.querySelector('.file-name');

    botaoRemover.addEventListener('click', () => {
        if (tabelaAnexos.querySelectorAll('tbody tr').length > 1) {
            linha.remove();
            const arquivoId = inputFile.dataset.arquivoId;
            if (arquivoId) {
                sessionStorage.removeItem(arquivoId);
            }
        } else {
            alert('Você deve ter pelo menos um anexo na tabela.');
        }
    });

    botaoVisualizar.addEventListener('click', () => {
      const arquivoId = inputFile.dataset.arquivoId;
      if (arquivoId) {
          const arquivoBlob = sessionStorage.getItem(arquivoId);
  
          const byteCharacters = atob(arquivoBlob.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);   
  
          }
          const byteArray = new Uint8Array(byteNumbers);
  
          const blob = new Blob([byteArray], { type:   
   inputFile.files[0].type });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = inputFile.files[0].name;
          link.click();
          window.URL.revokeObjectURL(url);
      }
  });

    inputFile.addEventListener('change', () => {
        const arquivo = inputFile.files[0];
        if (arquivo) {
            fileNameSpan.textContent = arquivo.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                const arquivoBlob = e.target.result;
                const arquivoId = `arquivo_${Date.now()}`; 
                sessionStorage.setItem(arquivoId, arquivoBlob);
                inputFile.dataset.arquivoId = arquivoId; 
            };
            reader.readAsDataURL(arquivo);
        } else {
            fileNameSpan.textContent = 'Nenhum arquivo selecionado';
        }
    });
}

attachEventListenersToAnexoRow(tabelaAnexos.querySelector('tbody tr'));

adicionarAnexoBtn.addEventListener('click', () => {
    const novaLinha = tabelaAnexos.querySelector('tbody tr').cloneNode(true);
    novaLinha.querySelector('input').value = ''; 
    novaLinha.querySelector('.file-name').textContent = 'Nenhum arquivo selecionado'; 
    tabelaAnexos.querySelector('tbody').appendChild(novaLinha);
    attachEventListenersToAnexoRow(novaLinha);
});


// API CEP

const cepInput = document.getElementById('cep');

cepInput.addEventListener('blur', () => {
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length === 8) { 
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('endereco').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('municipio').value = data.localidade;
                    document.getElementById('estado').value = data.uf;
                } else {
                    alert('CEP não encontrado.');
                    document.getElementById('endereco').value = '';
                    document.getElementById('bairro').value = '';
                    document.getElementById('municipio').value = '';
                    document.getElementById('estado').value = '';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
                alert('Ocorreu um erro ao buscar o CEP. Por favor, tente novamente mais tarde.');
            });
    }
});


// SALVAR FORNECEDOR JSON

const loadingModal = document.getElementById('loadingModal');
document.getElementById('salvarFornecedor').addEventListener('click', function(event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('cadastroForm'));

    const razaoSocial = formData.get('razaoSocial');
    const cnpj = formData.get('cnpj');
    const nomeFantasia = formData.get('nomeFantasia');
    const nomeContato = formData.get('nomeContato');
    const telefone = formData.get('telefone');
    const email = formData.get('email');

    if (!razaoSocial || !cnpj || !nomeFantasia || !nomeContato || !telefone || !email) {
        alert("Preencha todos os campos obrigatórios! (Razão social, nome fantasia, CNPJ, telefone, email)");
        return;
    }

    const produtos = [];
    const tabelaProdutos = document.querySelector('#tabelaProdutos tbody');
    const linhas = tabelaProdutos.querySelectorAll('tr:nth-child(odd)'); 

    linhas.forEach((linha, index) => {
        const descricao = linha.querySelector('input[name="descricao[]"]').value;
        const unidadeMedida = linha.nextElementSibling.querySelector('select[name="unidadeMedida[]"]').value;
        const quantidadeEstoque = linha.nextElementSibling.querySelector('input[name="quantidadeEstoque[]"]').value;
        const valorUnitario = linha.nextElementSibling.querySelector('input[name="valorUnitario[]"]').value;
        const valorTotal = linha.nextElementSibling.querySelector('input[name="valorTotal[]"]').value;

        if (!descricao || !unidadeMedida || !quantidadeEstoque || !valorUnitario) {
            alert(`Preencha todos os campos do produto na linha ${index + 1}!`);
            return;
        }

        produtos.push({
            indice: index + 1,
            descricaoProduto: descricao,
            unidadeMedida: unidadeMedida,
            qtdeEstoque: quantidadeEstoque,
            valorUnitario: valorUnitario,
            valorTotal: valorTotal
        });
    });

    if (produtos.length === 0) {
        alert("Adicione pelo menos um produto!");
        return;
    }

    const anexos = [];
    const inputsFile = tabelaAnexos.querySelectorAll('input[type="file"]');

    if (inputsFile.length === 0) {
        alert("Adicione pelo menos um anexo!");
        return;
    }

    inputsFile.forEach((inputFile, index) => {
        const arquivoId = inputFile.dataset.arquivoId;
        if (arquivoId) {
            anexos.push({
                indice: index + 1,
                nomeArquivo: inputFile.files[0].name,
                blobArquivo: sessionStorage.getItem(arquivoId)
            });
        }
    });

    const jsonDados = {
        razaoSocial: formData.get('razaoSocial'),
        nomeFantasia: formData.get('nomeFantasia'),
        cnpj: formData.get('cnpj'),
        inscricaoEstadual: formData.get('inscricaoEstadual'),
        inscricaoMunicipal: formData.get('inscricaoMunicipal'),
        nomeContato: formData.get('nomeContato'),
        telefoneContato: formData.get('telefone'),
        emailContato: formData.get('email'),
        produtos: produtos,
        anexos: anexos
    };

    console.log('jsonDados:', jsonDados);

    setTimeout(() => {
        const jsonText = JSON.stringify(jsonDados, null, 2);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dados_fornecedor.json';
        link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        window.URL.revokeObjectURL(url);
    }, 2000);
});

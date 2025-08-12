# Plano

Quero criar um CRM estilo pipeline (kanban)

Sprint Goal


Fazer login e ir para kanban

botão de add status:

abre modal com os campos:
- titulo: string
- cor: 
6 opções de cores: cinza, azul, amarelo, laranja, verde, vermelho
sendo cada uma vars definidas no globals com cores para light e dark


botão add novo lead:

abre um sheet (componente shadcn)

- nome: string
- e-mail: string.email
- telefone: string.number > (xx) 9 9999-9999
- empresa: string
- observações: string
- status: string
- histórico de interações: array de objeto {data: timestamp, notas: string}

Validações, máscaras de campo e formatação de valores para cada campo.

botão de salvar e cancelar

ao salvar fecha o sheet, e revalida os dados do kanban

---

Ao fechar e adicionar, mostra o card no kanban,
sendo cada coluna um status,
com os dados resumidos:

Nome
empresa
telefone
email
observações (truncar em 100 caracteres)

---

# Feito

[x] Configurações iniciais nextjs
[x] Configurações iniciais shadcn
[x] Auth e Db configurados com Firebase, firebase admin e mr-auth
[x] RBAC Configurado
[x] Tema configurado
[x] Navbar configurada
[x] Botões de Add Status e modal


# Sprint Backlog

Conseguir criar colunas estilo kanban/trello, de forma dinamica e responsiva

[ ] Botão de Add Lead e modal


botão add novo lead:

abre um sheet (componente shadcn)

- nome: string
- e-mail: string.email
- telefone: string.number > (xx) 9 9999-9999 formato brasil
- empresa: string
- observações: string
- status: string
- histórico de interações: array de objeto {data: timestamp do firestore, notas: string}

Validações, máscaras de campo e formatação de valores para cada campo.

botão de salvar e cancelar

ao salvar fecha o sheet, e revalida os dados do kanban (ainda não tem o kanban, mas já pode fazer o revalidate tag na action e ai ao criar o kanban seta a tag de revalidate)
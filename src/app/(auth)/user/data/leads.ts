/* 

leads:

interface:

- nome: string
- e-mail: string.email
- telefone: string.number > (xx) 9 9999-9999 formato brasil
- empresa: string
- observações: string
- status: string
- histórico de interações: array de objeto {data: timestamp do firestore, notas: string}
- ordem* propriedade escondida automatica

---

crud actions:

getAllLeads()

createLead()

readLead()

updateLead()

deleteLead()

---

funções de reordenar


*/
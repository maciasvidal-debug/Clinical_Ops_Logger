const fs = require('fs');
const path = require('path');

const typesPath = path.join('lib', 'i18n', 'types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

const newTypes = `
    exportMyDataDesc: string;
    dangerZone: string;
    dangerZoneDesc: string;
    deleteAccountButton: string;
    deleteAccountTitle: string;
    warning: string;
    deleteAccountWarning1: string;
    deleteAccountWarning2: string;
    deleteAccountWarning3: string;
    downloadDataBeforeDelete: string;
    downloadDataRecommendation: string;
    typePhraseToConfirm: string;
    deleteConfirmationPhrase: string;
    deleteSuccessDesc: string;
`;

if (!typesContent.includes('dangerZone: string;')) {
  typesContent = typesContent.replace('exportMyDataDesc: string;', newTypes);
  fs.writeFileSync(typesPath, typesContent);
}

const dictsPath = path.join('lib', 'i18n', 'dictionaries.ts');
let dictsContent = fs.readFileSync(dictsPath, 'utf8');

const enSettings = `exportMyDataDesc: 'In accordance with data protection regulations (GDPR / Chilean Law), you can download a copy of all information associated with your account (profile and activity logs) in a structured format (JSON).',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Deleting your account is an irreversible action. It will revoke your access and your personal data will be anonymized (although we will keep time and activity statistics).',
    deleteAccountButton: 'Delete My Account',
    deleteAccountTitle: 'Delete Account',
    warning: 'Warning',
    deleteAccountWarning1: 'This action is irreversible and will permanently revoke your access.',
    deleteAccountWarning2: 'Your personal data will be anonymized, but your time and activity records will be kept statistically for the system.',
    deleteAccountWarning3: 'Any pending queries in your activities will be automatically closed, notifying your withdrawal from the system. Assigned projects and protocols will be left orphaned.',
    downloadDataBeforeDelete: 'Download your data before continuing',
    downloadDataRecommendation: 'We recommend you download a backup of all your information (profile and activity logs) before deleting your account, as you will not be able to recover it except by express request to the administrator (retention for 30 days according to terms).',
    typePhraseToConfirm: 'To confirm, type the phrase: ',
    deleteConfirmationPhrase: 'CONFIRM DELETE',
    deleteSuccessDesc: 'Your account has been permanently deleted.'`;

const esSettings = `exportMyDataDesc: 'De acuerdo con la normativa de protección de datos (RGPD / Ley de Chile), puedes descargar una copia de toda la información asociada a tu cuenta (perfil y logs de actividades) en formato estructurado (JSON).',
    dangerZone: 'Zona de Peligro',
    dangerZoneDesc: 'Eliminar tu cuenta es una acción irreversible. Revocará tu acceso y se anonimizarán tus datos personales (aunque conservaremos estadísticas de tiempo y actividades).',
    deleteAccountButton: 'Eliminar mi cuenta',
    deleteAccountTitle: 'Eliminar Cuenta',
    warning: 'Advertencia',
    deleteAccountWarning1: 'Esta acción es irreversible y revocará tu acceso permanentemente.',
    deleteAccountWarning2: 'Tus datos personales serán anonimizados, pero tus registros de horas y actividades se mantendrán de forma estadística para el sistema.',
    deleteAccountWarning3: 'Cualquier consulta pendiente de resolver en tus actividades será cerrada automáticamente notificando tu baja del sistema. Los proyectos y protocolos asignados a ti quedarán huérfanos.',
    downloadDataBeforeDelete: 'Descarga tus datos antes de continuar',
    downloadDataRecommendation: 'Te recomendamos descargar un respaldo de toda tu información (perfil y logs de actividades) antes de eliminar tu cuenta, ya que no podrás recuperarla salvo solicitud expresa al administrador (retención por 30 días según términos).',
    typePhraseToConfirm: 'Para confirmar, escribe la frase: ',
    deleteConfirmationPhrase: 'CONFIRMO ELIMINAR',
    deleteSuccessDesc: 'Tu cuenta ha sido eliminada permanentemente.'`;

const ptSettings = `exportMyDataDesc: 'De acordo com os regulamentos de proteção de dados (GDPR / Lei Chilena), você pode baixar uma cópia de todas as informações associadas à sua conta (perfil e logs de atividades) em um formato estruturado (JSON).',
    dangerZone: 'Zona de Perigo',
    dangerZoneDesc: 'Excluir sua conta é uma ação irreversível. Isso revogará seu acesso e seus dados pessoais serão anonimizados (embora manteremos estatísticas de tempo e atividades).',
    deleteAccountButton: 'Excluir minha conta',
    deleteAccountTitle: 'Excluir Conta',
    warning: 'Aviso',
    deleteAccountWarning1: 'Esta ação é irreversível e revogará permanentemente o seu acesso.',
    deleteAccountWarning2: 'Seus dados pessoais serão anonimizados, mas seus registros de tempo e atividades serão mantidos estatisticamente para o sistema.',
    deleteAccountWarning3: 'Quaisquer consultas pendentes em suas atividades serão fechadas automaticamente, notificando sua retirada do sistema. Projetos e protocolos atribuídos ficarão órfãos.',
    downloadDataBeforeDelete: 'Baixe seus dados antes de continuar',
    downloadDataRecommendation: 'Recomendamos que você baixe um backup de todas as suas informações (perfil e logs de atividades) antes de excluir sua conta, pois não poderá recuperá-las, exceto mediante solicitação expressa ao administrador (retenção por 30 dias de acordo com os termos).',
    typePhraseToConfirm: 'Para confirmar, digite a frase: ',
    deleteConfirmationPhrase: 'CONFIRMAR EXCLUSAO',
    deleteSuccessDesc: 'Sua conta foi excluída permanentemente.'`;

dictsContent = dictsContent.replace(/exportMyDataDesc: 'In accordance[^']+JSON\)\.'/g, enSettings);
dictsContent = dictsContent.replace(/exportMyDataDesc: 'De acuerdo con la normativa[^']+JSON\)\.'/g, esSettings);
dictsContent = dictsContent.replace(/exportMyDataDesc: 'De acordo com os regulamentos[^']+JSON\)\.'/g, ptSettings);

fs.writeFileSync(dictsPath, dictsContent);
console.log('Translations updated successfully');

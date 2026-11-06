namespace PortalPremios.Api.Domain.Enums;

public enum UserRole
{
    User = 1,
    Manager = 2,
    Admin = 3
}

public enum TransactionType
{
    CampaignCredit = 1,      // Inserção de pontos na campanha
    DistributionToUser = 2,  // Distribuição de pontos da campanha para usuário (Débito da Campanha / Crédito do Usuário)
    Redemption = 3           // Resgate de prêmio pelo usuário (Débito do Usuário)
}

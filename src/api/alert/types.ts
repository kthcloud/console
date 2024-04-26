export interface Alert {
    title: string;
    content?: string;
    domains?: string[];
    pages?: string[];
    link?: string;
    showFrom?: string;
    showUntil?: string;
    severity?: 'success' | 'info' | 'warning' | 'error';
    variant?: 'filled' | 'outlined';
    active?: boolean;
}


export interface GetAlertsResponse {
    alerts: Alert[];
}
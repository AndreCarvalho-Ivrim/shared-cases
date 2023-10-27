export type NotificationToTypes = 'broadcast_hub' | 'broadcast' | 'broadcast_flow_auth' | 'hub_perms' | 'flow_perms' | 'hub_ids' | 'flow_auth_ids' | 'anonymous';
export type NotificationTypes = 'update' | 'mention' | 'alert' | 'reminder' | 'license';
export interface NotificationNotifyErrorType{
  tried_at: Date,
  attempt: number,
  by: 'email' | 'whatsapp' | 'sms' | 'process',
  error: any
}
export interface NotificationTemplateType{
  data: {
    params:  Record<string, string>,
    /**
     * Caso template_id = \@sla-notification matches é:
     * ```
     *  interface SlaNotificationMatches{
     *    datas: Array<{
     *      id: string,
     *      description: string
     *    }>
     *  }
     * ```
     */
    matches: Record<string, any>
  },
  /**
   * - \@sla-notification: É o template hardcode para notificação de sla
   * - string: _id do template do ISAC
   */
  template_id: '@sla-notification' | string,
  type: 'hardcode' | 'message' | 'email'
}
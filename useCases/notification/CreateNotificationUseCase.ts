import {
  NotificationToTypes,
  NotificationTypes,
  SimpleAuthenticatedCommunication,
  SimpleNotificationCacheMemoryRepository,
  SimpleNotificationGroupRepository,
  SimpleNotificationPreferenceRepository,
  SimpleNotificationRepository,
  SimpleUserCategoriesOnUsersRepository,
  SimpleUserCategoryPermitionRepository,
  SimpleUserRepository
} from "../../types";

interface DTONotification {
  title: string;
  description: string;
  type: NotificationTypes;
  icon?: string;
  redirect_to?: string;
  to: NotificationToTypes;
  user_id: string;
  client_id: string;
  flow_id?: string;
  priority?: number;
  is_hub?: boolean;
  ignore_client_id?: boolean;
  data?: string[]
  templates?: {
    template_id: string;
    type: string;
    data: string;
  }[],
  schedule: Date
}
interface NotifyByType{
  type: NotificationTypes;
  plataform?: boolean;
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}
export class CreateNotificationUseCase {
  constructor(
    private userRepo: SimpleUserRepository,
    private notificationRepo: SimpleNotificationRepository,
    private notificationGroupRepo: SimpleNotificationGroupRepository,
    private userCategoryPermitionRepo: SimpleUserCategoryPermitionRepository,
    private userContegoriesOnUsersRepo: SimpleUserCategoriesOnUsersRepository,
    private notificationPreferenceRepo: SimpleNotificationPreferenceRepository,
    private authenticatedCommunication: SimpleAuthenticatedCommunication,
    private notificationCacheMemo: SimpleNotificationCacheMemoryRepository
  ){ }

  async execute(data: DTONotification) {
    let notificationUsers: Array<{ 
      user: {
        id: string,
        email?: string,
        sms?: string,
        whatsapp?: string,
      },
      notification_group_id: string,
      notifyBy?: NotifyByType,
      is_archived?: boolean
    }> = [];
    let usersIds: string[] = [];

    switch (data.to) {
      case 'broadcast_hub':
        const allUsers = await this.userRepo.findUsers();
        const usersGroupById = allUsers.map(user => user.id).join(',');

        const notiGroupBroadcasdtHub = await this.notificationGroupRepo.create({
          type: data.to,
          data: usersGroupById,
          owner_id: data.user_id,
          is_hub: data.is_hub,
          client_id: data.ignore_client_id ? undefined : data.client_id,
        });

        allUsers.map(async (user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notiGroupBroadcasdtHub.id!
          });
        });
        break;

      case 'broadcast':
        if (!data.client_id) throw new Error('ID da empresa obrigatório.');

        const allUsersByClient = await this.userRepo.findAllUsers(data.client_id);
        const usersClientGroupById = allUsersByClient.map(user => user.id).join(',');

        const notiGroupBroadCast = await this.notificationGroupRepo.create({
          type: data.to,
          data: usersClientGroupById,
          client_id: data.ignore_client_id ? undefined : data.client_id,
          owner_id: data.user_id,
          is_hub: data.is_hub
        });

        allUsersByClient.map(async (user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notiGroupBroadCast.id!
          });
        })
        break;

      case 'hub_perms':
        if (!data.data || !Array.isArray(data.data) || !data.data.every((i) => typeof i === 'string')) throw new Error(
          'Selecione as permissões que deseja notificar'
        )

        let usersForSendNotification;

        if (!data.client_id || data.ignore_client_id) {
          usersForSendNotification = await this.userCategoryPermitionRepo.findRelationsSlugByPermitions(data.data);
        } else {
          usersForSendNotification = await this.userContegoriesOnUsersRepo.findRelationsSlugByUserCategory(data.data);
        }

        if (usersForSendNotification.length === 0) throw new Error("Nenhum usuário a ser notificado.");

        const notiGroupHubPerms = await this.notificationGroupRepo.create({
          type: data.to,
          data: data.data.join(','),
          client_id: data.ignore_client_id ? undefined : data.client_id,
          is_hub: data.is_hub,
          owner_id: data.user_id,
        });

        usersForSendNotification.map(async (user) => {
          usersIds.push(user.userId);

          notificationUsers.push({
            user: {
              id: user.userId,
              email: user.email,
              sms: user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notiGroupHubPerms.id!
          });
        });

        break;

      case 'hub_ids':
        if (!data.data || !Array.isArray(data.data) || !data.data.every((i) => typeof i === 'string')) throw new Error(
          'Selecione os usuários que deseja notificar'
        )
        const usersInId = await this.userRepo.findUsersInId(data.data);

        let notiGroupHubIdsId;

        if (usersInId.length > 1) {
          const notiGroupHubIds = await this.notificationGroupRepo.create({
            type: data.to,
            data: data.data.join(','),
            client_id: data.ignore_client_id ? undefined : data.client_id,
            owner_id: data.user_id,
            is_hub: data.is_hub
          });

          notiGroupHubIdsId = notiGroupHubIds.id
        }

        usersInId && usersInId.map((user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notiGroupHubIdsId || null
          });
        });
        break;

      case 'flow_perms':
        if(!data.flow_id) throw new Error(
          'É obrigatório informar o fluxo que deseja usar para selecionar as permissões'
        )
        if(!data.data || !Array.isArray(data.data) || !data.data.every((i) => typeof i === 'string')) throw new Error(
          'Selecione as permissões que deseja notificar'
        )

        const resUserFlowPerm = await this.authenticatedCommunication.getUsersWithFlowPermission(
          data.flow_id,
          data.data
        )

        if(!resUserFlowPerm.result) throw new Error(
          resUserFlowPerm.response
        )

        const userWithFlowPerm : {
          id: string,
          email?: string,
          sms?: string,
          whatsapp?: string,
        }[] = resUserFlowPerm.data ? resUserFlowPerm.data.map((perm) => ({
          id: perm.id,
          email: perm.email,
          sms: perm.whatsapp,
          whatsapp: perm.whatsapp,
        })) : []

        if (userWithFlowPerm.length === 0) throw new Error("Nenhum usuário a ser notificado.");
        const notificationFlowPerm = await this.notificationGroupRepo.create({
          type: data.to,
          data: userWithFlowPerm.map((uwfp) => uwfp.id).join(','),
          owner_id: data.user_id,
          is_hub: data.is_hub,
          client_id: data.client_id,
          flow_id: data.flow_id
        });

        userWithFlowPerm.map(async (user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.sms ?? user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notificationFlowPerm.id!
          });
        });
        break;

      case 'flow_auth_ids':
        if(!data.flow_id) throw new Error(
          'É obrigatório informar o fluxo que deseja usar para selecionar os usuários'
        )
        if(!data.data || !Array.isArray(data.data) || !data.data.every((i) => typeof i === 'string')) throw new Error(
          'Selecione os usuários que deseja notificar'
        )

        const resFlowAuth = await this.authenticatedCommunication.getFlowAuthsWithPreference(
          data.flow_id,
          data.data
        )

        if(!resFlowAuth.result) throw new Error(
          resFlowAuth.response
        )

        const userFlowAuth : {
          id: string,
          email?: string,
          sms?: string,
          whatsapp?: string,
          notifyBy?: NotifyByType,
          is_archived?: boolean
        }[] = resFlowAuth.data ? resFlowAuth.data.map((perm) => {
          let notifyBy : NotifyByType | undefined = undefined
          if(perm.preference && Array.isArray(perm.preference)) notifyBy = perm.preference.find(
            (pref) => pref.type === data.type
          )
          
          return {
            id: perm.id,
            email: perm.email,
            sms: perm.whatsapp,
            whatsapp: perm.whatsapp,
            notifyBy: notifyBy ? {
              type: data.type,
              plataform: notifyBy.plataform ?? false,
              email: notifyBy.email ?? false,
              sms: notifyBy.sms ?? false,
              whatsapp: notifyBy.whatsapp ?? false,
            } : undefined,
            is_archived: !!(notifyBy && (notifyBy as any).is_archived)
          }
        }) : []

        if (userFlowAuth.length === 0) throw new Error("Nenhum usuário a ser notificado.");
        const notificationFlowAuth = await this.notificationGroupRepo.create({
          type: data.to,
          data: data.data.join(','),
          owner_id: data.user_id,
          is_hub: data.is_hub,
          client_id: data.client_id,
          flow_id: data.flow_id
        });

        userFlowAuth.map(async (user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.sms ?? user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notificationFlowAuth.id!,
            notifyBy: user.notifyBy,
            is_archived: user.is_archived
          });
        });
        break;

      case 'broadcast_flow_auth':
        if(!data.flow_id) throw new Error(
          'É obrigatório informar o fluxo que deseja usar para notificar'
        )

        const resFlowAuthBroadcast = await this.authenticatedCommunication.getFlowAuthsWithPreference(
          data.flow_id, [], true
        )

        if(!resFlowAuthBroadcast.result) throw new Error(
          resFlowAuthBroadcast.response
        )

        const userFlowAuthBroadcast : {
          id: string,
          email?: string,
          sms?: string,
          whatsapp?: string,
          notifyBy?: NotifyByType,
          is_archived?: boolean
        }[] = resFlowAuthBroadcast.data ? resFlowAuthBroadcast.data.map((perm) => {
          let notifyBy : NotifyByType | undefined = undefined
          if(perm.preference && Array.isArray(perm.preference)) notifyBy = perm.preference.find(
            (pref) => pref.type === data.type
          )
          
          return {
            id: perm.id,
            email: perm.email,
            sms: perm.whatsapp,
            whatsapp: perm.whatsapp,
            notifyBy: notifyBy ? {
              type: data.type,
              plataform: notifyBy.plataform ?? false,
              email: notifyBy.email ?? false,
              sms: notifyBy.sms ?? false,
              whatsapp: notifyBy.whatsapp ?? false,
            } : undefined,
            is_archived: !!(notifyBy && (notifyBy as any).is_archived)
          }
        }) : []

        if (userFlowAuthBroadcast.length === 0) throw new Error("Nenhum usuário a ser notificado.");
        const notificationFlowAuthBroadcast = await this.notificationGroupRepo.create({
          type: data.to,
          data: userFlowAuthBroadcast.map((uwfp) => uwfp.id).join(','),
          owner_id: data.user_id,
          is_hub: data.is_hub,
          client_id: data.client_id,
          flow_id: data.flow_id
        });

        userFlowAuthBroadcast.map(async (user) => {
          usersIds.push(user.id);

          notificationUsers.push({
            user: {
              id: user.id,
              email: user.email,
              sms: user.sms ?? user.whatsapp,
              whatsapp: user.whatsapp
            },
            notification_group_id: notificationFlowAuthBroadcast.id!,
            notifyBy: user.notifyBy,
            is_archived: user.is_archived
          });
        });
        break;
      default: throw new Error(
        'Destino de notificação inválido'
      )
    }

    if (notificationUsers.length === 0) throw new Error("Nenhum usuário a ser notificado.");

    const usersPreferenceAll = await (async () => {
      if(['broadcast_flow_auth','flow_auth_ids'].includes(data.to)) return [];
      return await this.notificationPreferenceRepo.findByUserId(usersIds) ?? [];
    })()
    
    let templates : any;

    if (data.templates && data.templates.length > 0 || Array.isArray(data.templates)) {
      const template_id_data = data.templates.map(template => {
        return {
          template_id: template.template_id,
          type: template.type,
          data: template.data
        }
      });

      templates = {
        template_ids: template_id_data.map(id => id.template_id).join(','),
        template_datas: JSON.stringify(template_id_data),
      }
    }

    let notificationIdsForIsac: string[] = [];

    await Promise.all(
      notificationUsers.map(async (notificationUser) => {
        const originalPreference : {
          type: NotificationTypes,
          plataform?: 'hub',
          email?: string,
          sms?: string,
          whatsapp?: string,
        } = { type: data.type };

        let is_archived = false
        if(['broadcast_flow_auth','flow_auth_ids'].includes(data.to)){
          if(notificationUser.notifyBy){
            if(notificationUser.notifyBy.plataform) originalPreference.plataform = 'hub';
            ['email', 'sms', 'whatsapp'].forEach((prop) => {
              if(notificationUser.notifyBy && notificationUser.notifyBy[prop] && notificationUser.user[prop]){
                originalPreference[prop] = notificationUser.user[prop]
              }
            })
          }
          is_archived = !!notificationUser.is_archived;
        }else{
          const userPreferences = usersPreferenceAll.filter((preferences) => {
            if(preferences.user_id !== notificationUser.user.id) return false;
            if(data.ignore_client_id) return !preferences.client_id
            return !preferences.client_id || preferences.client_id === data.client_id
          });

          if (userPreferences.length > 0) {
            const orderPreference = data.ignore_client_id ? userPreferences[0] : userPreferences.sort((a) => {
              if (a.client_id === data.client_id) return -1;
              if (!a.client_id) return 1;
              return 0;
            })[0];
  
            is_archived = orderPreference.auto_archive_type ? (
              orderPreference.auto_archive_type.split(',').includes(data.type)
            ): false
            
            const notifJsonParse = (() => {
              try {
                const parsed = JSON.parse(orderPreference.notify_by)
  
                return Array.isArray(parsed) ? parsed : [];
              }
              catch(e){ return [] }
            })()
  
            const findedPreference = notifJsonParse.find(notify => notify.type === data.type);
  
            if (findedPreference) {
              if (findedPreference['plataform']) originalPreference.plataform = 'hub';
              if (findedPreference['email']) originalPreference.email = notificationUser.user.email;
              if (findedPreference['sms']) originalPreference.sms = notificationUser.user.sms;
              if (findedPreference['whatsapp']) originalPreference.whatsapp = notificationUser.user.whatsapp;
            }
          }
        }
        
        // SEMPRE EXISTE A CHAVE TYPE
        if (Object.keys(originalPreference).length === 1) originalPreference.plataform = 'hub';

        const notificationCreated = await this.notificationRepo.create({
          description: data.description,
          title: data.title,
          notify_by: JSON.stringify(originalPreference),
          to: data.to,
          type: data.type,
          user_id: notificationUser.user.id,
          notification_group_id: notificationUser.notification_group_id,
          owner_id: data.user_id,
          is_hub: data.is_hub,
          is_sended: originalPreference.plataform && Object.keys(originalPreference).length === 1 ? true : false,
          icon: data.icon,
          client_id: !data.client_id || data.ignore_client_id ? undefined : data.client_id,
          priority: data.priority,
          redirect_to: data.redirect_to,
          ...(templates ? {
            template_datas: templates.template_datas,
            template_ids: templates.template_ids,
          }:{}),
          is_archived,
          schedule: data.schedule,
          flow_id: ['broadcast_flow_auth','flow_auth_ids','flow_perms'].includes(
            data.to
          ) ? data.flow_id : undefined
        });

        if(!data.schedule){
          this.notificationCacheMemo.clearCache(notificationUser.user.id, data.client_id, [
            'broadcast_flow_auth','flow_auth_ids'
          ].includes(data.to) ? data.flow_id : undefined)
        }

        if(Object.keys(originalPreference).some((by) => ['whatsapp', 'email'].includes(by))){
          if(notificationCreated.id) notificationIdsForIsac.push(notificationCreated.id);
        };
      })
    )

    try{
      await this.authenticatedCommunication.sendNotifications(notificationIdsForIsac);
    } catch (error) {
      throw new Error(error.message ?? 'Não foi possível disparar a(s) notificação(ões)');
    }

    return notificationIdsForIsac;
  }
}
import { ISessionRepository, ISessionSingletonRepository } from "../types/session.type";
import { Session } from "../entities/Session";
import { PreDefinedApiFeedbacks } from "../types/session.type";
import { convertDate, differenceMinutes } from "../utils/date";
import { ISingletonSessionRepositoryApiHubAndIsac } from "../types";

export interface ShortSession{
  user_id: string,
  ip: string,
  device: string,
  city?: string,
  state?: string,
  country?: string,
}
export class SingletonSessionRepository implements ISessionSingletonRepository {
  private static instance: SingletonSessionRepository;
  private loggedSessions: Record<string, Session>;
  private now = convertDate(this.application, new Date());
  private sessionExpireMinutes: number = 3; 
  private sessionExpireMinutesByLastAccess: number = 3;
  private requestsToDeleteCacheInProgress: string[];

  private constructor(
    private application: string,
    private sessionRepo: ISessionRepository,
    private api: ISingletonSessionRepositoryApiHubAndIsac
  ) {
    this.loggedSessions = { };
    this.requestsToDeleteCacheInProgress = []
  }

  public static getInstance(
    application: string,
    sessionRepo: ISessionRepository,
    api: ISingletonSessionRepositoryApiHubAndIsac
  ): SingletonSessionRepository {
    if (!SingletonSessionRepository.instance) {
      SingletonSessionRepository.instance = new SingletonSessionRepository(application, sessionRepo, api);
    }
    return SingletonSessionRepository.instance;
  }

  public async checkActiveSession(currentSession: ShortSession): Promise<Session> {    
    let startedSession: Session | undefined = this.loggedSessions[currentSession.user_id];
    
    if (!startedSession) {
      const existsSession = await this.sessionRepo.findLastActiveSessionOfUserId(currentSession.user_id);
      if(!existsSession) return;

      this.loggedSessions[currentSession.user_id] = existsSession;
      startedSession = existsSession;
    }
    
    let changedState = ['device'].some((key) => startedSession[key] !== currentSession[key]);
    if(changedState || (
      startedSession.ip !== currentSession.ip &&
      !['15.228.146.170','172.27.0.4'].includes(currentSession.ip)
    )){
      const expiredSession = differenceMinutes(this.application, startedSession.last_access) <= (Number(this.sessionExpireMinutes) * 3);
      if(expiredSession) throw new Error("There is already another session" as PreDefinedApiFeedbacks);
      else {
        await this.disableSession(startedSession)
        return;
      }
    }
    return startedSession;
  }
  public deleteCacheSession(userId: string, sessionId?: string): void {
    if(!sessionId || this.loggedSessions[userId]?.id === sessionId){
      delete this.loggedSessions[userId];
    }
  }  
  public async handleLastAccessOfSession(currentSession: Session, depth = 0){
    const difference = differenceMinutes(this.application, currentSession.last_access);
    if(difference >= this.sessionExpireMinutesByLastAccess) {
      if(depth === 0){
        const isTheSame = await this.checkIfCacheIsTheSameAsTheDB(currentSession)
        if(!isTheSame){
          if(!this.loggedSessions[currentSession.user_id]){
            await this.initiateSession(currentSession);
            return;
          }
          
          const checkedSession = await this.checkActiveSession(currentSession);
          if(!checkedSession){
            await this.initiateSession(currentSession);
            return;
          }
  
          await this.handleLastAccessOfSession(checkedSession, depth - 1);
          return;
        }
      }

      const date = new Date();
      const updatedSession = await this.sessionRepo.update(
        currentSession.id, { 
          last_access: date,
          updated_at: date,
          device: currentSession.device 
        }
      )
      
      this.loggedSessions[currentSession.user_id] = updatedSession;
      await this.handleSendUpdateCacheSession(currentSession.user_id, updatedSession.id);
    }
  }
  public async initiateSession(session: ShortSession){
    const createdSession: Session = await this.sessionRepo.create({
      ...session,
      session_start_date: this.now,
      last_access: this.now,
      active: true,
      created_at: this.now,
    });
    
    this.loggedSessions[session.user_id] = createdSession;
  }
  public async disableSession(session: Session){
    await this.sessionRepo.update(session.id, { active: false });
    delete this.loggedSessions[session.user_id];
    await this.handleSendUpdateCacheSession(session.user_id, session.id);
  }

  private async handleSendUpdateCacheSession(user_id: string, session_id: string){
    if(this.requestsToDeleteCacheInProgress.includes(user_id)) return;

    this.requestsToDeleteCacheInProgress.push(user_id)
    await this.api.sendUpdateCacheSession(user_id, session_id); 
    this.requestsToDeleteCacheInProgress = this.requestsToDeleteCacheInProgress.filter((id) => id !== user_id);
  }
  private async checkIfCacheIsTheSameAsTheDB(currentSession: Session){
    const existsSession = await this.sessionRepo.findLastActiveSessionOfUserId(currentSession.user_id);
    if(!existsSession){
      this.deleteCacheSession(currentSession.user_id, currentSession.id);
      return false;
    }

    if (currentSession.updated_at !== existsSession.updated_at) {
      this.loggedSessions[currentSession.user_id] = existsSession;
      return false;
    }
    return true;
  }
}
import { SimpleNotificationRepository } from "../../types";

interface DTONotification{
  id: string,
  type: 'id' | 'external_id'
}
export class DeleteNotificationUseCase{
  constructor(
    private notificationRepo: SimpleNotificationRepository,
  ){}

  async execute(data: DTONotification) {
    if(data.type === 'id') await this.notificationRepo.deleteId(
      data.id
    )
    else if(data.type === 'external_id') await this.notificationRepo.deleteExternalId(
      data.id
    )
  }
}
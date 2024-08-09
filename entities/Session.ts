import { v4 as uuid_v4 } from "uuid";
import UAParser from "ua-parser-js";
import axios from "axios";
import * as momentTz from "moment-timezone";
import { convertDate } from "../utils/date";

export interface SessionType extends Omit<Session, 'id'>{
  id?: string
}

export interface SessionLocationType {
  city: string
  state: string
  country: string
}

export class Session {
  public readonly id: string;
  public session_start_date: Date;
  public last_access: Date;
  public active: boolean;
  public user_id: string;
  public ip: string;
  public device: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public created_at: Date;
  public updated_at?: Date;

  constructor(props: Omit<Session, "id">, id?: string) {
    Object.assign(this, props);

    if (!id) {
      this.id = uuid_v4()
    } else {
      this.id = id;
    };

    if(typeof this.active !== 'boolean') this.active = ['1',1,'true'].includes(this.active) ? true : false
    if(!this.created_at) this.created_at = new Date();
    if(!this.updated_at) this.updated_at = new Date();

    this.ip = Session.parseIp(this.ip)
  }

  static parseIp(ip: string){
    let normalizedIp = ip === "::1" ? "127.0.0.1" : ip;
    if (normalizedIp.lastIndexOf(":")) {
      normalizedIp = normalizedIp.slice(
        normalizedIp.lastIndexOf(":") + 1, 
        normalizedIp.length
      );
    }
    return normalizedIp;
  }

  static getDevice(userAgent: string) {
    const parser = new UAParser();
    const device = parser.setUA(userAgent).getDevice().type;
    return device ?? "desktop";
  }

  static async getLocation(ip: string): Promise<SessionLocationType> {
    let location = {
      city: undefined,
      state: undefined,
      country: undefined,
    }

    try {
      const { data } = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 1000
      });
      if(data.message !== 'reserved range') location = {
        city: data.city,
        state: data.region,
        country: data.country === 'Brazil' ? 'Brasil' : data.country, 
      };

      return location;
    } catch (error) {
      return location;
    }
  }
}
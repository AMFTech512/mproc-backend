import { Resend } from "resend";
import { DIContainer } from "./di";

const DEFAULT_FROM_EMAIL = "Austin Fay <austin@mproc.io>";
const DEFAULT_AUDIENCE_ID = "cf9fb491-4cf4-48f1-98fa-e3c6a6d847d3";

export interface NewContactOpts {
  email: string;
  firstName?: string;
  lastName?: string;
  audienceId?: string;
  unsubscribed?: false;
}

export class EmailService {
  private _resendClient: Resend;

  constructor(container: DIContainer) {
    this._resendClient = container.resendClient;
  }

  async addContact(opts: NewContactOpts) {
    const res = await this._resendClient.contacts.create({
      email: opts.email,
      firstName: opts.firstName,
      lastName: opts.lastName,
      audienceId: opts.audienceId ?? DEFAULT_AUDIENCE_ID,
      unsubscribed: opts.unsubscribed ?? false,
    });

    if (res.error) {
      throw res.error;
    }
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    html: string,
    fromEmail = DEFAULT_FROM_EMAIL
  ) {
    const res = await this._resendClient.emails.send({
      to: toEmail,
      from: fromEmail,
      subject,
      html,
    });

    if (res.error) {
      throw res.error;
    }
  }
}

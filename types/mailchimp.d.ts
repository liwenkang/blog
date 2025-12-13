declare module '@mailchimp/mailchimp_marketing' {
  interface Config {
    apiKey: string
    server: string
  }

  interface ListMember {
    id: string
    email_address: string
    status: string
    [key: string]: any
  }

  interface Lists {
    addListMember(listId: string, body: any): Promise<ListMember>
    [key: string]: any
  }

  interface Mailchimp {
    setConfig(config: Config): void
    lists: Lists
    [key: string]: any
  }

  const mailchimp: Mailchimp
  export default mailchimp
}

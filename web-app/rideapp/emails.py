from notipyer.email_notify import set_email_config,send_email
def send_email_to(to_recipients,subject,body):
    SENDER_EMAIL = 'tangcl998@gmail.com'
    SENDER_PASS = 'kyjgdivcwocvijmn'
    set_email_config(SENDER_EMAIL, SENDER_PASS)
    cc_recipients = None
    bcc_recipients = None
    send_email(subject, body, to_recipients, cc_recipients, bcc_recipients)

if __name__ == "__main__":
    #send_email_to(['ct265@duke.edu'], "subject", "here")
    print(f''' dasfgag%s
          dsafg %s
          ag
          ''' % ("a","b"))
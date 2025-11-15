import pt from '../../locales/pt-BR.json'
export default function FAQs() {
    const messages = pt
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            {messages.faqs.title}
                        </h2>
                        <p>{messages.faqs.supportBody}</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">{messages.faqs.refundHeading}</h3>
                            <p className="text-muted-foreground mt-4">{messages.faqs.refundBody}</p>

                            <ol className="list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground mt-4">{messages.faqs.refundStep1}</li>
                                <li className="text-muted-foreground mt-4">{messages.faqs.refundStep2}</li>
                                <li className="text-muted-foreground mt-4">{messages.faqs.refundStep3}</li>
                            </ol>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{messages.faqs.cancelHeading}</h3>
                            <p className="text-muted-foreground mt-4">{messages.faqs.cancelBody}</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{messages.faqs.upgradeHeading}</h3>
                            <p className="text-muted-foreground my-4">{messages.faqs.upgradeBody}</p>
                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">You will be charged the difference in price between your current plan and the plan you are upgrading to.</li>
                                <li className="text-muted-foreground">Your new plan will take effect immediately and you will be billed at the new rate on your next billing cycle.</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">{messages.faqs.supportHeading}</h3>
                            <p className="text-muted-foreground mt-4">{messages.faqs.supportBody}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

import AnimatedSection, { AnimatedItem, type DepthLevel } from './AnimatedSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqProps = {
  title: string;
  items: FaqItem[];
  depth?: DepthLevel;
  className?: string;
};

const Faq = ({ title, items, depth = 'surface', className }: FaqProps) => {
  return (
    <AnimatedSection
      depth={depth}
      className={className}
      containerClassName="space-y-8"
      aria-labelledby="faq-heading"
    >
      <AnimatedItem as="h2" id="faq-heading" className="text-center text-3xl font-bold text-boteco-neutral md:text-4xl">
        {title}
      </AnimatedItem>
      <Accordion type="single" collapsible className="mx-auto w-full max-w-3xl text-left">
        {items.map((item, index) => (
          <AccordionItem key={`${item.question}-${index}`} value={`item-${index + 1}`}>
            <AccordionTrigger className="text-left text-lg font-semibold text-boteco-neutral">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-boteco-neutral/80">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </AnimatedSection>
  );
};

export default Faq;

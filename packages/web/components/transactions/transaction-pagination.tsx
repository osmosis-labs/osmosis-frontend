import { type LinkProps } from "next/link";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const TransactionsPaginaton = ({
  showPrevious,
  showNext,
  previousHref,
  nextHref,
}: {
  showPrevious: boolean;
  showNext: boolean;
  previousHref: LinkProps["href"];
  nextHref: LinkProps["href"];
}) => {
  return (
    <Pagination>
      <PaginationContent>
        {showPrevious && (
          <PaginationItem>
            <PaginationPrevious href={previousHref} className="!rounded-full" />
          </PaginationItem>
        )}
        {showNext && (
          <PaginationItem>
            <PaginationNext href={nextHref} className="!rounded-full" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export { TransactionsPaginaton };

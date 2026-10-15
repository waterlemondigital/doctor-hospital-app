import { Link } from 'react-router-dom';
import { HelpCircle, Building2, UserRound, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center space-y-6 max-w-lg mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#caf0f8] text-[#0077b6] shadow-xs">
        <HelpCircle className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#03045e]">
          Page Not Found (404)
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The healthcare resource or profile you are seeking may have been renamed, moved, or is currently under statutory review.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
        <Button asChild variant="outline" className="gap-2 justify-center">
          <Link to="/hospitals">
            <Building2 className="h-4 w-4 text-[#0077b6]" />
            <span>Browse Hospitals</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="gap-2 justify-center">
          <Link to="/doctors">
            <UserRound className="h-4 w-4 text-[#0077b6]" />
            <span>Browse Doctors</span>
          </Link>
        </Button>
      </div>

      <div className="pt-2">
        <Button asChild variant="default" className="bg-[#0077b6] hover:bg-[#03045e] gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

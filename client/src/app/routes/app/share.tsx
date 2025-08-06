import { useEffect, useState } from 'react';
import {
  LuArrowLeft as ArrowLeftIcon,
  LuCircleCheck as CheckCircleIcon,
  LuClock as ClockIcon,
  LuCircleX as XCircleIcon,
  LuCircleAlert as AlertIcon,
  LuLoaderCircle as LoaderIcon,
} from 'react-icons/lu';
import { useParams, useSearchParams, useNavigate } from 'react-router';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { paths } from '@/config/paths';
import { api } from '@/lib/api';

export default function Share() {
  const { shareid } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<
    'loading' | 'redirecting' | 'waiting' | 'rejected' | 'error'
  >('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!shareid || !token) {
      setStatus('error');
      setMessage('Invalid share link.');
      return;
    }

    const accessDocument = async () => {
      try {
        const res = await api.get(`/document/share/${shareid}`, {
          params: { token },
        });

        if (res.status === 200) {
          const docId = res.data.id;
          setStatus('redirecting');
          setTimeout(() => {
            navigate(paths.app.document.getHref(docId));
          }, 1500);
        } else if (res.status === 202) {
          setStatus('waiting');
          setMessage(
            res.data?.message || 'Request submitted. Waiting for approval.',
          );
        } else {
          setStatus('error');
          setMessage('Unexpected server response.');
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message;

        if (status === 403) {
          setStatus('rejected');
          setMessage(msg || 'You do not have access to this document.');
        } else {
          setStatus('error');
          setMessage(msg || 'Something went wrong accessing the document.');
        }
      }
    };

    accessDocument();
  }, [shareid, token, navigate]);

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: LoaderIcon,
          iconClass: 'text-blue-500 animate-spin',
          bgClass:
            'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
          textClass: 'text-blue-700 dark:text-blue-300',
          title: 'Validating Access',
          subtitle: 'Checking your permissions...',
        };
      case 'redirecting':
        return {
          icon: CheckCircleIcon,
          iconClass: 'text-green-500',
          bgClass:
            'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
          textClass: 'text-green-700 dark:text-green-300',
          title: 'Access Granted',
          subtitle: 'Redirecting you to the document...',
        };
      case 'waiting':
        return {
          icon: ClockIcon,
          iconClass: 'text-amber-500',
          bgClass:
            'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
          textClass: 'text-amber-700 dark:text-amber-300',
          title: 'Pending Approval',
          subtitle: message,
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          iconClass: 'text-red-500',
          bgClass:
            'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
          textClass: 'text-red-700 dark:text-red-300',
          title: 'Access Denied',
          subtitle: message,
        };
      case 'error':
        return {
          icon: AlertIcon,
          iconClass: 'text-red-500',
          bgClass:
            'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
          textClass: 'text-red-700 dark:text-red-300',
          title: 'Error',
          subtitle: message,
        };
      default:
        return {
          icon: AlertIcon,
          iconClass: 'text-gray-500',
          bgClass:
            'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
          textClass: 'text-gray-700 dark:text-gray-300',
          title: 'Unknown Status',
          subtitle: 'Something unexpected happened.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleBackToDashboard = () => {
    navigate(paths.app.dashboard.getHref());
  };

  return (
    <DashboardLayout title="Document Access">
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          {/* Status Card */}
          <div
            className={`p-8 rounded-xl border shadow-sm transition-all duration-300 ${config.bgClass}`}
          >
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-3 rounded-full  shadow-sm">
                  <Icon className={`w-8 h-8 ${config.iconClass}`} />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {config.title}
                </h1>
                <p className={`text-sm leading-relaxed ${config.textClass}`}>
                  {config.subtitle}
                </p>
              </div>

              {/* Action Button for Error States */}
              {(status === 'rejected' || status === 'error') && (
                <div className="pt-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}

              {/* Loading Indicator for Waiting State */}
              {status === 'waiting' && (
                <div className="pt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    We'll notify you when access is granted
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info for Waiting State */}
          {status === 'waiting' && (
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>This usually takes a few minutes.</p>
              <p>
                You can safely close this page and when approved document will
                be on dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

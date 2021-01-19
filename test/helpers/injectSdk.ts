export type InjectSdkInput = {
  sdkUrl: string;
  accountId: string;
  publisherId: string;
  disableGdpr: boolean;
};

declare global {
  interface Window {
    edktInitializor: {
      invoked?: boolean;
      disableGdpr?: boolean;
      accountId?: string;
      publisherId?: string;
      apiKey?: string;
      clientId?: string;
      load?: (arg0?: string) => void;
    };
  }
}

export const injectSdk = ({
  sdkUrl,
  accountId,
  publisherId,
  disableGdpr,
}: InjectSdkInput): void => {
  const edktInitializor = (window.edktInitializor =
    window.edktInitializor || {});
  edktInitializor.invoked = true;
  edktInitializor.disableGdpr = disableGdpr || false;
  edktInitializor.accountId = accountId;
  edktInitializor.publisherId = publisherId;
  edktInitializor.apiKey = '';
  edktInitializor.load = function () {
    // const p = e ? e : 'sdk';
    const n = window.document.createElement('script');
    n.type = 'text/javascript';
    n.async = true;
    n.src = sdkUrl;
    n.crossOrigin = 'anonymous';
    n.referrerPolicy = 'unsafe-url';
    const a = window.document.getElementsByTagName('script')[0];
    const scriptContainer = (a && a.parentNode) || window.document.body;
    scriptContainer.insertBefore(n, a);
  };
  edktInitializor.load(edktInitializor.clientId);
};

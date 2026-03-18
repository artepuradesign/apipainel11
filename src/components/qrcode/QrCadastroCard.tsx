import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { type QrRegistration } from '@/services/qrcodeRegistrationsService';

interface QrCadastroCardProps {
  registration: QrRegistration;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

const getQrCodeUrl = (registration: QrRegistration) => {
  if (registration.qr_code_path) {
    return `https://qr.apipainel.com.br/qrvalidation/${registration.qr_code_path}`;
  }

  const viewUrl = `https://qr.apipainel.com.br/qrvalidation/?token=${registration.token}&ref=${registration.token}&cod=${registration.token}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewUrl)}`;
};

const getPhotoUrl = (registration: QrRegistration) => {
  if (!registration.photo_path) return null;
  return `https://qr.apipainel.com.br/qrvalidation/${registration.photo_path}`;
};

export default function QrCadastroCard({ registration }: QrCadastroCardProps) {
  const daysLeft = Math.ceil((new Date(registration.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-lg border border-border bg-card p-2.5 sm:p-3">
      <div className="flex gap-2.5">
        <div className="flex gap-2 flex-shrink-0">
          {getPhotoUrl(registration) ? (
            <img
              src={getPhotoUrl(registration)!}
              alt={`Foto de ${registration.full_name}`}
              className="object-cover rounded-lg border w-16 h-20 sm:w-20 sm:h-24"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-muted rounded-lg flex items-center justify-center border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <img
            src={getQrCodeUrl(registration)}
            alt={`QR Code de ${registration.full_name}`}
            className="border w-20 h-20 sm:w-24 sm:h-24"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold truncate">{registration.full_name}</p>
          <p className="text-[11px] sm:text-xs text-foreground font-mono">{registration.document_number}</p>
          <p className="text-[11px] sm:text-xs text-foreground">Nasc. {formatDate(registration.birth_date)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-medium ${daysLeft > 0 ? 'text-green-600' : 'text-destructive'}`}>
              {daysLeft > 0 ? `${daysLeft} dias` : 'Expirado'}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1 py-0 ${
                registration.is_expired
                  ? 'border-destructive/50 text-destructive bg-destructive/10'
                  : registration.validation === 'verified'
                    ? 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10'
                    : 'border-amber-500/50 text-amber-600 bg-amber-500/10'
              }`}
            >
              {registration.is_expired ? 'Expirado' : registration.validation === 'verified' ? 'Verificado' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

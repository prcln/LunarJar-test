import { useState, useEffect } from 'react';
import './ShareModal.css';
import {
  CopyIcon, CheckIcon, DownloadIcon, SpinnerIcon, SCTwitterIcon, SCFacebookIcon,
  SCLinkedInIcon, SCWhatsAppIcon, SCTelegramIcon, PaperAirplaneIcon,
  SpinnerIconNoSpin
} from '../../utils/Icons'; // Make sure this import path is correct
import { shareToSocialMedia } from '../../utils/shareSocial';

// A new, separate component for the large QR Code modal
const QrCodeModal = ({ isOpen, onClose, qrCodeUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={qrCodeUrl} alt="Enlarged QR Code" className="large-qr-image" />
        <p className="qr-modal-text">🌟 Scan this code to open the Wish Tree 🌟</p>
      </div>
    </div>
  );
};

export default function ShareModal({ isOpen, onClose, treeData, user, onRegenerateInviteLink, isRegenerating, cooldown }) {
  const [copied, setCopied] = useState(null); // Tracks which link is copied: 'public' or 'invite'

  const [qrCode, setQrCode] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false); // State for the new QR modal

  const getPublicInvite = () => {
    if (!treeData?.slug) return '';
    return `${window.location.origin}/tree/${treeData.slug}`;
  };

  const getPrivateInvite = () => {
    if (!treeData?.slug && !treeData?.inviteToken) return '';
    return `${window.location.origin}/c/${treeData.inviteToken}`;
  };

  useEffect(() => {
    if (isOpen && treeData?.slug) {
      const url = getPublicInvite();
      // Using a larger size for better quality in the QR modal
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
      setQrCode(qrUrl);
    }
  }, [isOpen, treeData]);

  const copyToClipboard = async (textToCopy, type) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'my-wish-tree-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const socialPlatforms = [
    { name: 'modernshare', icon: <PaperAirplaneIcon />, className: 'modernshare' },
    { name: 'twitter', icon: <SCTwitterIcon />, className: 'twitter' },
    { name: 'facebook', icon: <SCFacebookIcon />, className: 'facebook' },
    { name: 'linkedin', icon: <SCLinkedInIcon />, className: 'linkedin' },
    { name: 'whatsapp', icon: <SCWhatsAppIcon />, className: 'whatsapp' },
    { name: 'telegram', icon: <SCTelegramIcon />, className: 'telegram' },
  ];

  if (!isOpen) return null;

  if (!user) {
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="close-btn">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <p>Please log in to share your tree.</p>
    </div>
  </div>
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="close-btn">
            {/* Close Icon SVG */}
          </button>
          <div className="modal-body">
            <h2 className="share-title">Share Your Tree!</h2>

            {/* Public Link */}
            <div className="share-section">
              <label className="section-label">Public Link</label>
              <div className="link-container">
                <input type="text" value={getPublicInvite()} readOnly className="link-input" />
                <button onClick={() => copyToClipboard(getPublicInvite(), 'public')} className="copy-btn">
                  {copied === 'public' ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>

            {/* Collaborator Invite Link (Conditional) */}
            {!treeData.isPublic && (
              <div className="share-section">
                <label className="section-label">Collaborator Invite Link</label>
                <div className="link-container">
                  <input type="text" value={getPrivateInvite()} readOnly className="link-input" />
                    <button onClick={() => copyToClipboard(getPrivateInvite(), 'invite')} className="copy-btn">
                      {copied === 'invite' ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    <button 
                      onClick={onRegenerateInviteLink} 
                      className="regen-btn"
                      disabled={cooldown > 0 || isRegenerating} // Disable button during cooldown
                    >
                      {cooldown > 0 
                        ? `${cooldown}` 
                        : (isRegenerating ? <SpinnerIcon /> : <SpinnerIconNoSpin />)}
                    </button>   
                </div>
              </div>)}

            {/* QR Code & Social Media */}
            <div className="qr-social-container">
              {qrCode && (
                <div className="qr-compact">
                  <img src={qrCode} alt="QR Code" className="qr-image-small" onClick={() => setIsQrModalOpen(true)} />
                  <button onClick={downloadQRCode} className="download-btn-compact" title="Download QR">
                    <DownloadIcon />
                  </button>
                </div>
              )}

              {/* Add this separator element */}
                {qrCode && <div className="separator"></div>}

              <div className="social-grid-compact">
                {socialPlatforms.map((platform) => (
                  <button key={platform.name} onClick={() => shareToSocialMedia(platform.name, treeData.name, treeData.slug)} title={platform.name.charAt(0).toUpperCase() + platform.name.slice(1)} className={`social-btn-compact ${platform.className}`}>
                    {platform.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} qrCodeUrl={qrCode} />
    </>
  );
}
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Building, Globe, Mail, Phone, Edit, Save } from 'lucide-react';
import { companyService } from '../../api/companyService';
import { CompanyDetailsDto, CreateCompanyDto } from '../../types/dashboard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CompanyDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<CompanyDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await companyService.getCompanyProfile();
      setProfile(res);
      setName(res.name);
      setAddress(res.address || '');
      setIndustry(res.industry || '');
      setWebsite(res.website || '');
      setCity(res.city || '');
      setContactEmail(res.contactEmail || '');
      setContactPhone(res.contactPhone || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateCompanyDto = {
      name,
      address: address || '',
      industry: industry || undefined,
      website: website || undefined,
      city: city || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
    };

    try {
      setSaving(true);
      await companyService.updateCompanyProfile(dto);
      toast.success('Company profile updated');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Company Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Corporate profile management & active training overview
          </p>
        </div>

        <Button variant={editing ? 'ghost' : 'outline'} onClick={() => setEditing(!editing)} leftIcon={<Edit className="w-4 h-4" />}>
          {editing ? 'Cancel Editing' : 'Edit Company Info'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{profile?.name}</h2>
              <p className="text-xs text-slate-400">{profile?.industry || 'Corporate Partner'}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-slate-400">Active Trainees</p>
              <p className="font-extrabold text-emerald-600 text-lg">{profile?.totalTrainees ?? 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Approval Status</p>
              <p className="font-semibold text-emerald-500">{profile?.isApproved ? 'Approved Partner' : 'Pending Review'}</p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          {editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                <Input label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={saving}>
                  Save Profile
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Company Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400">Website</p>
                  <p className="font-semibold">{profile?.website || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-semibold">{profile?.city || profile?.address || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Contact Email</p>
                  <p className="font-semibold">{profile?.contactEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Contact Phone</p>
                  <p className="font-semibold">{profile?.contactPhone || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

import { 
  SA_COUNCIL_REGIONS, 
  ADELAIDE_HILLS_TOWNSHIPS, 
  DAYS, 
  MONTHS, 
  YEARS,
  COUNTRIES 
} from '../../utils/constants';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface GeneralInfoStepProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

export function GeneralInfoStep({ formData, handleChange }: GeneralInfoStepProps) {
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email) {
        const { data, error } = await supabase
          .from('registrations')
          .select('email')
          .eq('email', formData.email)
          .single();

        if (data) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      }
    };

    checkEmail();
  }, [formData.email]);

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
        <h4 className="text-xl font-bold text-blue-900 mb-4">Personal Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter email address"
            />
            {emailExists && <p className="text-red-500 text-sm">Email already exists. Please use a different email.</p>}
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Phone <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="mt-6">
          <label className="block text-lg font-bold text-gray-700 mb-2">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="I use a different term">I use a different term</option>
          </select>
        </div>

        {/* Conditional Gender Other Input */}
        {formData.gender === 'I use a different term' && (
          <div className="mt-4">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Please specify <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.genderOther}
              onChange={(e) => handleChange('genderOther', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter your gender identity"
            />
          </div>
        )}

        {/* Date of Birth */}
        <div className="mt-6">
          <label className="block text-lg font-bold text-gray-700 mb-2">
            Date of Birth <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Day</label>
              <select
                value={formData.dobDay}
                onChange={(e) => handleChange('dobDay', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Day</option>
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Month</label>
              <select
                value={formData.dobMonth}
                onChange={(e) => handleChange('dobMonth', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Month</option>
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Year</label>
              <select
                value={formData.dobYear}
                onChange={(e) => handleChange('dobYear', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Home Address Section */}
      <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
        <h4 className="text-xl font-bold text-green-900 mb-4">Home Address</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Address Line 1 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Township <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.township}
              onChange={(e) => handleChange('township', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select township</option>
              {ADELAIDE_HILLS_TOWNSHIPS.map(township => (
                <option key={township} value={township}>{township}</option>
              ))}
            </select>
          </div>

          {/* Conditional Township Other Input */}
          {formData.township === 'Other' && (
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Please specify township <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.townshipOther}
                onChange={(e) => handleChange('townshipOther', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your township"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Post Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.postCode}
                onChange={(e) => handleChange('postCode', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter post code"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Council Region <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.councilRegion}
                onChange={(e) => handleChange('councilRegion', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a region</option>
                {SA_COUNCIL_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Postal Address Section */}
      <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
        <h4 className="text-xl font-bold text-purple-900 mb-4">Postal Address (if different)</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Postal Address Line 1
            </label>
            <input
              type="text"
              value={formData.postalAddressLine1}
              onChange={(e) => handleChange('postalAddressLine1', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Postal street address (optional)"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Postal Address Line 2
            </label>
            <input
              type="text"
              value={formData.postalAddressLine2}
              onChange={(e) => handleChange('postalAddressLine2', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Postal apartment, suite, etc. (optional)"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Postal Post Code
            </label>
            <input
              type="text"
              value={formData.postalPostcode}
              onChange={(e) => handleChange('postalPostcode', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Postal post code (optional)"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
        <h4 className="text-xl font-bold text-red-900 mb-4">Emergency Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Emergency Contact First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.emergencyContactFirstName}
              onChange={(e) => handleChange('emergencyContactFirstName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Emergency Contact Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.emergencyContactLastName}
              onChange={(e) => handleChange('emergencyContactLastName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Last name"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Emergency Contact Phone <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Relationship
            </label>
            <input
              type="text"
              value={formData.emergencyContactRelationship}
              onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Emergency Contact Address
            </label>
            <input
              type="text"
              value={formData.emergencyContactAddress}
              onChange={(e) => handleChange('emergencyContactAddress', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Full address (optional)"
            />
          </div>
        </div>
      </div>

      {/* Cultural Background Section */}
      <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
        <h4 className="text-xl font-bold text-yellow-900 mb-4">Cultural Background (Optional)</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Do you identify as Aboriginal or Torres Strait Islander?
            </label>
            <select
              value={formData.identifyAboriginalTSI}
              onChange={(e) => handleChange('identifyAboriginalTSI', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select an option</option>
              <option value="No">No</option>
              <option value="Yes - Aboriginal">Yes - Aboriginal</option>
              <option value="Yes - Torres Strait Islander">Yes - Torres Strait Islander</option>
              <option value="Yes - Both">Yes - Both</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Country of Birth
            </label>
            <select
              value={formData.countryOfBirth}
              onChange={(e) => handleChange('countryOfBirth', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Do you speak a language other than English at home?
            </label>
            <select
              value={formData.speakOtherLanguage}
              onChange={(e) => handleChange('speakOtherLanguage', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select an option</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {formData.speakOtherLanguage === 'Yes' && (
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Please specify the language(s)
              </label>
              <input
                type="text"
                value={formData.otherLanguageDetails}
                onChange={(e) => handleChange('otherLanguageDetails', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter language(s)"
              />
            </div>
          )}

          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              Cultural Identity
            </label>
            <select
              value={formData.culturalIdentity}
              onChange={(e) => handleChange('culturalIdentity', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select an option</option>
              <option value="No">I do not identify with any cultural group</option>
              <option value="Yes">Yes, I identify with a cultural group</option>
            </select>
          </div>

          {formData.culturalIdentity === 'Yes' && (
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Please specify your cultural identity
              </label>
              <input
                type="text"
                value={formData.culturalIdentityDetails}
                onChange={(e) => handleChange('culturalIdentityDetails', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter cultural identity"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
        <h4 className="text-xl font-bold text-indigo-900 mb-4">Communication Preferences</h4>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.receiveNewsletter}
              onChange={(e) => handleChange('receiveNewsletter', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">
              I would like to receive newsletters
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.receiveCourseNotifications}
              onChange={(e) => handleChange('receiveCourseNotifications', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">
              I would like to receive course/program notifications
            </span>
          </label>
        </div>
      </div>

      {/* Referral Sources Section */}
      <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
        <h4 className="text-xl font-bold text-orange-900 mb-4">How did you hear about us?</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralBrochure}
              onChange={(e) => handleChange('referralBrochure', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Brochure</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralReferral}
              onChange={(e) => handleChange('referralReferral', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Referral</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralEmailFromHut}
              onChange={(e) => handleChange('referralEmailFromHut', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Email from The Hut</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralFamilyFriend}
              onChange={(e) => handleChange('referralFamilyFriend', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Family/Friend</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralSocialMedia}
              onChange={(e) => handleChange('referralSocialMedia', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Social Media (Facebook)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralLocalNewspaper}
              onChange={(e) => handleChange('referralLocalNewspaper', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Local Newspaper</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralLocalNoticeboard}
              onChange={(e) => handleChange('referralLocalNoticeboard', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Local Noticeboard</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.referralWeb}
              onChange={(e) => handleChange('referralWeb', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Web</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-lg font-bold text-gray-700 mb-2">
            Other (please specify)
          </label>
          <input
            type="text"
            value={formData.referralOther}
            onChange={(e) => handleChange('referralOther', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Please specify other referral source"
          />
        </div>
      </div>

      {/* Photo Consent Section */}
      <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-200">
        <h4 className="text-xl font-bold text-pink-900 mb-4">Photo Consent</h4>
        <p className="text-gray-700 mb-4">
          I give permission for The Hut to use photographs or video recordings of me for:
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photoConsentWebsite}
              onChange={(e) => handleChange('photoConsentWebsite', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Website</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photoConsentSocialMedia}
              onChange={(e) => handleChange('photoConsentSocialMedia', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Social Media</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photoConsentAnnualReport}
              onChange={(e) => handleChange('photoConsentAnnualReport', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Annual Report</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photoConsentBrochures}
              onChange={(e) => handleChange('photoConsentBrochures', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Brochures and Flyers</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.photoConsentLocalMedia}
              onChange={(e) => handleChange('photoConsentLocalMedia', e.target.checked)}
              className="w-6 h-6 rounded border-2 border-gray-300"
            />
            <span className="text-lg font-semibold text-gray-700">Local Media</span>
          </label>
        </div>
      </div>
    </div>
  );
}

interface ProgramSelectionStepProps {
  selectedPrograms: string[];
  onToggleProgram: (programId: string) => void;
}

export function ProgramSelectionStep({ selectedPrograms, onToggleProgram }: ProgramSelectionStepProps) {
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; description: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Map database programs to our format with colors
      const colors = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'indigo', 'teal', 'cyan', 'yellow', 'amber', 'lime'];
      const mappedPrograms = (data || []).map((prog, index) => ({
        id: prog.id,
        name: prog.name,
        description: prog.description || 'Program details',
        color: colors[index % colors.length]
      }));
      
      setPrograms(mappedPrograms);
    } catch (err) {
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses: Record<string, { bg: string; border: string; selected: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', selected: 'border-blue-600 bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-300', selected: 'border-green-600 bg-green-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', selected: 'border-purple-600 bg-purple-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-300', selected: 'border-orange-600 bg-orange-100' },
    red: { bg: 'bg-red-50', border: 'border-red-300', selected: 'border-red-600 bg-red-100' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', selected: 'border-pink-600 bg-pink-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', selected: 'border-indigo-600 bg-indigo-100' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-300', selected: 'border-teal-600 bg-teal-100' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', selected: 'border-cyan-600 bg-cyan-100' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', selected: 'border-yellow-600 bg-yellow-100' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-300', selected: 'border-amber-600 bg-amber-100' },
    lime: { bg: 'bg-lime-50', border: 'border-lime-300', selected: 'border-lime-600 bg-lime-100' }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="bg-yellow-50 p-8 rounded-xl border-4 border-yellow-200 text-center">
        <p className="text-xl font-bold text-yellow-900 mb-2">No Programs Available</p>
        <p className="text-lg text-yellow-700">
          Please contact staff to add programs before registering.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
        <p className="text-lg font-semibold text-blue-900">
          Select one or more programs you're interested in joining:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(program => {
          const isSelected = selectedPrograms.includes(program.id);
          const colors = colorClasses[program.color];
          
          return (
            <button
              key={program.id}
              type="button"
              onClick={() => onToggleProgram(program.id)}
              className={`p-6 rounded-xl border-4 text-left transition-all ${
                isSelected 
                  ? colors.selected + ' shadow-lg transform scale-105'
                  : colors.bg + ' ' + colors.border + ' hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                  isSelected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                }`}>
                  {isSelected && <Check size={20} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-bold text-gray-900 mb-1">{program.name}</h5>
                  <p className="text-gray-700">{program.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPrograms.length > 0 && (
        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 mt-6">
          <p className="text-lg font-semibold text-green-900">
            {selectedPrograms.length} program{selectedPrograms.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}

interface ProgramSpecificStepProps {
  selectedPrograms: string[];
  programData: Record<string, any>;
  onDataChange: (programId: string, field: string, value: any) => void;
}

export function ProgramSpecificStep({ selectedPrograms, programData, onDataChange }: ProgramSpecificStepProps) {
  // Programs that need additional information
  const programRequirements: Record<string, { fields: Array<{ name: string; label: string; type: string; options?: string[]; allowMultiple?: boolean }> }> = {
    'chi-kung': {
      fields: [
        { name: 'medicalConditions', label: 'Do you have any medical conditions we should be aware of?', type: 'textarea' },
        { name: 'mobilityLevel', label: 'Mobility Level', type: 'select', options: ['Good', 'Moderate', 'Limited'] }
      ]
    },
    'outdoor-playgroup': {
      fields: [
        { name: 'children', label: 'Children Information', type: 'multiple-children', allowMultiple: true }
      ]
    },
    'dungeons-dragons': {
      fields: [
        { name: 'experienceLevel', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
        { name: 'characterPreference', label: 'Preferred Character Type', type: 'text' }
      ]
    },
    'homework-club': {
      fields: [
        { name: 'students', label: 'Students Information', type: 'multiple-students', allowMultiple: true }
      ]
    },
    'strength-balance-stirling': {
      fields: [
        { name: 'medicalConditions', label: 'Do you have any medical conditions we should be aware of?', type: 'textarea' },
        { name: 'mobilityAids', label: 'Do you use mobility aids?', type: 'select', options: ['No', 'Yes - Walking stick', 'Yes - Walker', 'Yes - Wheelchair', 'Yes - Other'] }
      ]
    },
    'community-fun-fitness': {
      fields: [
        { name: 'fitnessLevel', label: 'Current Fitness Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
        { name: 'healthConsiderations', label: 'Any health considerations?', type: 'textarea' }
      ]
    },
    'mens-moves': {
      fields: [
        { name: 'fitnessLevel', label: 'Current Fitness Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
        { name: 'injuries', label: 'Any injuries or physical limitations?', type: 'textarea' }
      ]
    },
    'community-shed': {
      fields: [
        { name: 'interests', label: 'What projects are you interested in?', type: 'textarea' },
        { name: 'skills', label: 'Do you have any woodworking or metalworking skills?', type: 'select', options: ['No experience', 'Some experience', 'Experienced'] }
      ]
    },
    'walking-group': {
      fields: [
        { name: 'walkingPace', label: 'Preferred Walking Pace', type: 'select', options: ['Leisurely', 'Moderate', 'Brisk'] },
        { name: 'mobilityLevel', label: 'Any mobility considerations?', type: 'textarea' }
      ]
    }
  };

  const programsNeedingInfo = selectedPrograms.filter(id => programRequirements[id]);

  // Helper functions for children (Outdoor Playgroup)
  const addChild = (programId: string) => {
    const currentChildren = programData[programId]?.children || [];
    onDataChange(programId, 'children', [...currentChildren, { name: '', age: '', allergies: '' }]);
  };

  const removeChild = (programId: string, index: number) => {
    const currentChildren = programData[programId]?.children || [];
    const newChildren = currentChildren.filter((_: any, i: number) => i !== index);
    onDataChange(programId, 'children', newChildren);
  };

  const updateChild = (programId: string, index: number, field: string, value: any) => {
    const currentChildren = programData[programId]?.children || [];
    const newChildren = [...currentChildren];
    newChildren[index] = { ...newChildren[index], [field]: value };
    onDataChange(programId, 'children', newChildren);
  };

  // Helper functions for students (Homework Club)
  const addStudent = (programId: string) => {
    const currentStudents = programData[programId]?.students || [];
    onDataChange(programId, 'students', [...currentStudents, { name: '', gradeLevel: '', subjectsNeedHelp: '' }]);
  };

  const removeStudent = (programId: string, index: number) => {
    const currentStudents = programData[programId]?.students || [];
    const newStudents = currentStudents.filter((_: any, i: number) => i !== index);
    onDataChange(programId, 'students', newStudents);
  };

  const updateStudent = (programId: string, index: number, field: string, value: any) => {
    const currentStudents = programData[programId]?.students || [];
    const newStudents = [...currentStudents];
    newStudents[index] = { ...newStudents[index], [field]: value };
    onDataChange(programId, 'students', newStudents);
  };

  if (programsNeedingInfo.length === 0) {
    return (
      <div className="bg-green-50 p-8 rounded-xl border-4 border-green-200 text-center">
        <Check size={64} className="text-green-600 mx-auto mb-4" />
        <h4 className="text-2xl font-bold text-green-900 mb-2">All Set!</h4>
        <p className="text-lg text-green-700">
          The programs you selected don't require additional information. Click "Complete Registration" to finish.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
        <p className="text-lg font-semibold text-blue-900">
          Please provide additional information for the programs you selected:
        </p>
      </div>

      {programsNeedingInfo.map(programId => {
        const requirements = programRequirements[programId];
        const data = programData[programId] || {};

        return (
          <div key={programId} className="bg-white p-6 rounded-xl border-4 border-purple-200 shadow-md">
            <h4 className="text-xl font-bold text-purple-900 mb-4">
              {programId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h4>
            
            <div className="space-y-4">
              {requirements.fields.map(field => (
                <div key={field.name}>
                  {/* Multiple Children for Outdoor Playgroup */}
                  {field.type === 'multiple-children' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-lg font-bold text-gray-700">
                          Children Attending
                        </label>
                        <button
                          type="button"
                          onClick={() => addChild(programId)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus size={20} />
                          <span>Add Child</span>
                        </button>
                      </div>

                      {(data.children || []).map((child: any, index: number) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 relative">
                          <button
                            type="button"
                            onClick={() => removeChild(programId, index)}
                            className="absolute top-3 right-3 text-red-600 hover:text-red-800 transition-colors"
                            title="Remove child"
                          >
                            <Trash2 size={20} />
                          </button>

                          <h5 className="text-md font-bold text-gray-700 mb-3">Child {index + 1}</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Child's Name
                              </label>
                              <input
                                type="text"
                                value={child.name || ''}
                                onChange={(e) => updateChild(programId, index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Enter child's name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Child's Age
                              </label>
                              <input
                                type="number"
                                value={child.age || ''}
                                onChange={(e) => updateChild(programId, index, 'age', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Age"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                              Allergies or Dietary Requirements
                            </label>
                            <textarea
                              value={child.allergies || ''}
                              onChange={(e) => updateChild(programId, index, 'allergies', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                              rows={2}
                              placeholder="Enter any allergies or dietary requirements"
                            />
                          </div>
                        </div>
                      ))}

                      {(!data.children || data.children.length === 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 text-center">
                          <p className="text-gray-600">No children added yet. Click "Add Child" to get started.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multiple Students for Homework Club */}
                  {field.type === 'multiple-students' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-lg font-bold text-gray-700">
                          Students Attending
                        </label>
                        <button
                          type="button"
                          onClick={() => addStudent(programId)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus size={20} />
                          <span>Add Student</span>
                        </button>
                      </div>

                      {(data.students || []).map((student: any, index: number) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200 relative">
                          <button
                            type="button"
                            onClick={() => removeStudent(programId, index)}
                            className="absolute top-3 right-3 text-red-600 hover:text-red-800 transition-colors"
                            title="Remove student"
                          >
                            <Trash2 size={20} />
                          </button>

                          <h5 className="text-md font-bold text-gray-700 mb-3">Student {index + 1}</h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Student's Name
                              </label>
                              <input
                                type="text"
                                value={student.name || ''}
                                onChange={(e) => updateStudent(programId, index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Enter student's name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Grade Level
                              </label>
                              <input
                                type="text"
                                value={student.gradeLevel || ''}
                                onChange={(e) => updateStudent(programId, index, 'gradeLevel', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Grade 5"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                              Subjects Needing Help
                            </label>
                            <textarea
                              value={student.subjectsNeedHelp || ''}
                              onChange={(e) => updateStudent(programId, index, 'subjectsNeedHelp', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                              rows={2}
                              placeholder="e.g., Math, English, Science"
                            />
                          </div>
                        </div>
                      ))}

                      {(!data.students || data.students.length === 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 text-center">
                          <p className="text-gray-600">No students added yet. Click "Add Student" to get started.</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Regular field types */}
                  {field.type === 'text' && (
                    <>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={data[field.name] || ''}
                        onChange={(e) => onDataChange(programId, field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </>
                  )}
                  
                  {field.type === 'number' && (
                    <>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        value={data[field.name] || ''}
                        onChange={(e) => onDataChange(programId, field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </>
                  )}
                  
                  {field.type === 'textarea' && (
                    <>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <textarea
                        value={data[field.name] || ''}
                        onChange={(e) => onDataChange(programId, field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                        rows={3}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </>
                  )}
                  
                  {field.type === 'select' && field.options && (
                    <>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <select
                        value={data[field.name] || ''}
                        onChange={(e) => onDataChange(programId, field.name, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select an option</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
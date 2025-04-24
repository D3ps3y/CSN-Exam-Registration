from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import Exam

User = get_user_model()

#########################################################################
# Unified Registration Form
#########################################################################
class UnifiedRegisterForm(UserCreationForm):
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'First Name'}),
        label="First Name"
    )
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Last Name'}),
        label="Last Name"
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'Email Address'}),
        label="Email Address"
    )

    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Password"
    )
    # Password field for the user's password, with a placeholder 'NSHE ID'

    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'NSHE ID'}),
        label="Confirm Password"
    )
    # Confirmation password field, with a placeholder 'NSHE ID'

    university_id = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'University ID (if applicable)'}),
        label="University ID"
    )
    
    class Meta:
        model = User
        # Update the fields list to include university_id instead of student_id.
        fields = ["first_name", "last_name", "email", "university_id", "password1", "password2"]

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if email:
            # Accept only emails ending with @student.csn.edu or @csn.edu.
            if not (email.endswith("@student.csn.edu") or email.endswith("@csn.edu")):
                raise forms.ValidationError(
                    "Email must end with @student.csn.edu (for students) or @csn.edu (for faculty)."
                )
            if User.objects.filter(email=email).exists():
                raise forms.ValidationError("A user with this email already exists.")
        return email

    def clean_university_id(self):
        # Return the university_id value (empty values are allowed)
        return self.cleaned_data.get("university_id", "").strip()

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data.get("email")

        if User.objects.filter(username=email).exists():
            raise ValueError("Attempted to save a user with duplicate username/email.")

        user.username = self.cleaned_data["email"]
        # Sets the user's username to their email

        user.email = self.cleaned_data["email"]
        # Ensures the email is stored in the email field

        # Automatically set the university_id based on the part before the '@'
        university_id = self.cleaned_data.get("university_id")
        if not university_id:
            user.university_id = email.split('@')[0]
        else:
            user.university_id = university_id
        
        # Determine role based on email domain.
        if email.endswith("@csn.edu"):
            user.is_faculty = True
            user.university_id = None  # Faculty may not require an ID.
        else:
            user.is_faculty = False

        # Set the username as the email if not provided.
        if not user.username:
            user.username = email

        if commit:
            user.save()
        return user

#########################################################################
# Login Form
#########################################################################
class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'placeholder': 'Email Address'}),
        label="Email"
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
        label="Password"
    )

#########################################################################
# Exam Form (for Faculty)
#########################################################################
class ExamForm(forms.ModelForm):
    EXAM_SUBJECT_CHOICES = [
        ('ABDY', 'Auto Body'),
        ('AC', 'Air Conditioning Technology'),
        ('ACC', 'Accounting'),
        ('ADT', 'Architectural Design Technology'),
        ('AES', 'Aerospace Studies'),
        ('AIT', 'Apprenticeship Industrial Technology'),
        ('ALS', 'Applied Laboratory Sciences'),
        ('AM', 'American Sign Language'),
        ('ANIM', 'Animation'),
        ('ANTH', 'Anthropology'),
        ('ARA', 'Arabic'),
        ('ARM', 'Armenian'),
        ('ART', 'Art'),
        ('ASB', 'Asian Studies'),
        ('AST', 'Astronomy'),
        ('AUTO', 'Automotive Technology'),
        ('AV', 'Aviation'),
        ('BIOL', 'Biology'),
        ('BRL', 'Barbering'),
        ('BUS', 'Business'),
        ('CADD', 'Computer Aided Drafting and Design'),
        ('CAPS', 'Computer Applications'),
        ('CEE', 'Civil and Environmental Engineering'),
        ('CEM', 'Construction Engineering Management'),
        ('CHEM', 'Chemistry'),
        ('CHI', 'Chinese'),
        ('CHS', 'Chicano Studies'),
        ('CIT', 'Computing and Information Technology'),
        ('CLS', 'Clinical Laboratory Sciences'),
        ('CMA', 'Clinical Medical Assisting'),
        ('COM', 'Communication'),
        ('CONS', 'Construction Management'),
        ('COT', 'Computing Technologies'),
        ('CPD', 'Career Personal Development'),
        ('CPE', 'Computer Engineering'),
        ('CPT', 'Carpentry'),
        ('CRJ', 'Criminal Justice'),
        ('CRS', 'Crisis Response Studies'),
        ('CS', 'Computer Science'),
        ('CSCO', 'Cisco Networking'),
        ('CSEC', 'Cybersecurity'),
        ('CUL', 'Culinary Arts'),
        ('DA', 'Dental Assisting'),
        ('DAN', 'Dance'),
        ('DH', 'Dental Hygiene'),
        ('DT', 'Diesel Technology'),
        ('DWA', 'Digital Web Applications'),
        ('DWF', 'Digital Web Foundations'),
        ('ECE', 'Early Childhood Education'),
        ('ECON', 'Economics'),
        ('EDU', 'Education'),
        ('EE', 'Electrical Engineering'),
        ('EGG', 'Engineering'),
        ('ELEC', 'Electrical Technology'),
        ('EMHS', 'Emergency Management and Homeland Security'),
        ('EMS', 'Emergency Medical Services'),
        ('ENG', 'English'),
        ('ENV', 'Environmental Science'),
        ('EPD', 'Emergency Preparedness'),
        ('EPY', 'Educational Psychology'),
        ('ESL', 'English as a Second Language'),
        ('ET', 'Engineering Technology'),
        ('FAB', 'Food and Beverage Management'),
        ('FIL', 'Filipino'),
        ('FIN', 'Finance'),
        ('FLCV', 'Floriculture'),
        ('FLOR', 'Floral Design'),
        ('FMM', 'Fashion Merchandising Management'),
        ('FREN', 'French'),
        ('FT', 'Fire Technology'),
        ('FUNS', 'Funeral Services'),
        ('GAM', 'Gaming Management'),
        ('GEOG', 'Geography'),
        ('GEOL', 'Geology'),
        ('GER', 'German'),
        ('GIS', 'Geographic Information Systems'),
        ('GLO', 'Global Studies'),
        ('GLZR', 'Glazier'),
        ('GRC', 'Graphic Communications'),
        ('GRE', 'Greek'),
        ('HAW', 'Hawaiian'),
        ('HHP', 'Health and Human Performance'),
        ('HIST', 'History'),
        ('HIT', 'Health Information Technology'),
        ('HMD', 'Hotel Management'),
        ('HUM', 'Humanities'),
        ('IRW', 'Integrated Reading and Writing'),
        ('IS', 'Information Systems'),
        ('ITAL', 'Italian'),
        ('JOUR', 'Journalism'),
        ('JPN', 'Japanese'),
        ('KOR', 'Korean'),
        ('LAS', 'Latin American Studies'),
        ('LAT', 'Latin'),
        ('LAW', 'Law'),
        ('LIB', 'Library Science'),
        ('MA', 'Medical Assisting'),
        ('MATH', 'Mathematics'),
        ('ME', 'Mechanical Engineering'),
        ('MGT', 'Management'),
        ('MHDD', 'Mental Health Directing and Development'),
        ('MIL', 'Military Science'),
        ('MKT', 'Marketing'),
        ('MOT', 'Medical Office Technology'),
        ('MT', 'Manufacturing Technology'),
        ('MTT', 'Machine Tool Technology'),
        ('MUS', 'Music'),
        ('MUSA', 'Applied Music'),
        ('MUSE', 'Music Ensembles'),
        ('MWA', 'Metal Working Arts'),
        ('NRES', 'Natural Resources'),
        ('NURS', 'Nursing'),
        ('NUTR', 'Nutrition'),
        ('OPE', 'Operating Engineers'),
        ('OPHT', 'Ophthalmic Technology'),
        ('OPME', 'Operating Engineers Maintenance'),
        ('PDA', 'Public Administration'),
        ('PEX', 'Physical Education'),
        ('PHAR', 'Pharmacy Technology'),
        ('PHIL', 'Philosophy'),
        ('PHO', 'Photography'),
        ('PHYS', 'Physics'),
        ('PLA', 'Paralegal Studies'),
        ('PLCM', 'Plumbing'),
        ('PN', 'Practical Nursing'),
        ('PORT', 'Portuguese'),
        ('PPF', 'Protective Services'),
        ('PSC', 'Political Science'),
        ('PSY', 'Psychology'),
        ('PT', 'Physical Therapy'),
        ('PTD', 'Physical Therapy Directing'),
        ('RDTP', 'Radiation Therapy'),
        ('RE', 'Real Estate'),
        ('READ', 'Reading'),
        ('RFR', 'Refrigeration'),
        ('RST', 'Religious Studies'),
        ('RUS', 'Russian'),
        ('SCT', 'Surgical Technology'),
        ('SEA', 'Southeast Asian Studies'),
        ('SMTL', 'Sheet Metal Technology'),
        ('SOC', 'Sociology'),
        ('SON', 'Sonography'),
        ('SPAN', 'Spanish'),
        ('SRGT', 'Surgical Technology'),
        ('STAT', 'Statistics'),
        ('SUR', 'Surveying'),
        ('TCA', 'Tourism and Convention Administration'),
        ('THAI', 'Thai'),
        ('THTR', 'Theatre'),
        ('TLS', 'Transitional Learning Skills'),
        ('TMST', 'Transportation Management'),
        ('URST', 'Urban Studies'),
        ('VETN', 'Veterinary Nursing'),
        ('VID', 'Videography'),
        ('WELD', 'Welding'),
        ('WMST', "Women's Studies"),
        ('WWT', 'Water/Wastewater Technology'),
    ]

    CAMPUS_CHOICES = [
        ('Henderson', 'Henderson'),
        ('North Las Vegas', 'North Las Vegas'),
        ('West Charleston', 'West Charleston'),
    ]

    BUILDING_CHOICES = [
        ('Building A', 'Building A'),
        ('Building B', 'Building B'),
        ('Building C', 'Building C'),
        ('Building D', 'Building D'),
        ('Building E', 'Building E'),
        ('Building F', 'Building F'),
        ('Building G', 'Building G'),
        ('Building H', 'Building H'),
        ('Building I', 'Building I'),
        ('Building J', 'Building J'),
        ('Building K', 'Building K'),
        ('Building L', 'Building L'),
        ('Building M', 'Building M'),
        ('Building N', 'Building N'),
        ('Building O', 'Building O'),
        ('Building P', 'Building P'),
        ('Building Q', 'Building Q'),
        ('Building R', 'Building R'),
        ('Building S', 'Building S'),
        ('Building T', 'Building T'),
        # Add more as needed
    ]

    exam_subject = forms.ChoiceField(choices=EXAM_SUBJECT_CHOICES)
    location = forms.ChoiceField(choices=CAMPUS_CHOICES)
    building = forms.ChoiceField(choices=BUILDING_CHOICES)

    exam_time = forms.TimeField(
        widget=forms.TimeInput(
            attrs={
                'type': 'time',
                'step': 1800  # 30 minutes = 1800 seconds
            }
        )
    )

    class Meta:
        model = Exam
        fields = [
            'exam_subject',
            'exam_number',
            'location',
            'building',
            'room_number',
            'exam_date',
            'exam_time',
            'max_seats',
        ]
        widgets = {
            'exam_date': forms.DateInput(attrs={'type': 'date'}),
            'exam_number': forms.TextInput(attrs={
                'placeholder': 'Enter exam number'}),
            'room_number': forms.TextInput(attrs={
                'placeholder': 'Enter room number'}),
        }
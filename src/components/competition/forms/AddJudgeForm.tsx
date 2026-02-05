import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEvent } from '@/contexts/EventContext';
import { ShieldCheck, Plus, Trash2, UserPlus, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

const judgeSchema = z.object({
    firstName: z.string().min(2, "Il nome è obbligatorio"),
    lastName: z.string().min(2, "Il cognome è obbligatorio"),
    code: z.string().min(4, "Minimo 4 caratteri").max(8, "Massimo 8 caratteri"),
});

type JudgeFormValues = z.infer<typeof judgeSchema>;

interface AddJudgeFormProps {
    onSuccess?: () => void;
}

export const AddJudgeForm: React.FC<AddJudgeFormProps> = ({ onSuccess }) => {
    const { currentEvent, judges, addJudge, removeJudge } = useEvent();

    const form = useForm<JudgeFormValues>({
        resolver: zodResolver(judgeSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            code: '',
        },
    });

    const onSubmit = async (values: JudgeFormValues) => {
        try {
            await addJudge(values.firstName.trim(), values.lastName.trim(), values.code.trim());
            form.reset();
        } catch (err) {
            console.error('Errore aggiunta giudice:', err);
        }
    };

    return (
        <DialogContent className="max-w-2xl border-white/5 bg-background shadow-2xl rounded-[3rem] p-0 overflow-hidden">
            <div className="bg-navy p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                <DialogHeader>
                    <DialogTitle className="text-3xl font-display font-black uppercase tracking-tighter flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-gold" />
                        Justice Control Panel
                    </DialogTitle>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Gestione Ufficiale Collegio Giudicante</p>
                </DialogHeader>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-12">
                {/* Lista Giudici Esistenti */}
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-gold" />
                        Giudici Accreditati ({judges.length})
                    </h4>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {judges.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed border-navy/5 rounded-[2rem]">
                                <p className="text-[10px] font-bold text-navy/20 uppercase">Nessun giudice assegnato</p>
                            </div>
                        ) : (
                            judges.map((j) => (
                                <div key={j.id} className="group p-4 rounded-2xl bg-slate-50 border border-navy/5 flex items-center justify-between hover:border-gold/30 hover:bg-white transition-all duration-300">
                                    <div className="space-y-1">
                                        <p className="font-display font-black text-navy text-sm uppercase truncate max-w-[120px]">
                                            {j.judges_registry?.first_name} {j.judges_registry?.last_name}
                                        </p>
                                        <Badge variant="outline" className="font-mono text-[9px] bg-white border-navy/5 text-gold-dark px-2">
                                            CODE: {j.access_code}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeJudge(j.id)}
                                        className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Form Nuovo Giudice */}
                <div className="space-y-8 bg-slate-50/50 p-6 rounded-[2.5rem] border border-navy/5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-navy/40 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-gold" />
                        Nuovo Accredito
                    </h4>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[9px] font-black uppercase tracking-widest text-navy/40">Nome</FormLabel>
                                            <FormControl>
                                                <Input className="h-11 rounded-xl bg-white border-navy/5 focus:border-gold transition-all" placeholder="es. Mario" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[9px] font-black uppercase tracking-widest text-navy/40">Cognome</FormLabel>
                                            <FormControl>
                                                <Input className="h-11 rounded-xl bg-white border-navy/5 focus:border-gold transition-all" placeholder="es. Rossi" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[9px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-navy/40">Codice Temporaneo</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-12 rounded-xl bg-white border-gold/20 focus:border-gold text-lg font-display font-black tracking-[0.3em] uppercase text-navy"
                                                placeholder="G01"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[9px]" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-14 bg-navy hover:bg-navy-dark text-white font-display font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-navy/20 hover:scale-[1.02] transition-all"
                            >
                                Emetti Credenziali
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </DialogContent>
    );
};

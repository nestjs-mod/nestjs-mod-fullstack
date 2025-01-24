'use strict';
(self.webpackChunkclient = self.webpackChunkclient || []).push([
  ['main'],
  {
    8653: (le, at, m) => {
      var me = m(345),
        Pt = m(8454),
        b = m(1626),
        e = m(4438),
        Rt = m(728),
        P = m(4710),
        g = m(6941),
        f = m(3414),
        Q = m(4226);
      class L {
        apiKeys;
        username;
        password;
        accessToken;
        basePath;
        withCredentials;
        encoder;
        encodeParam;
        credentials;
        constructor(s = {}) {
          (this.apiKeys = s.apiKeys),
            (this.username = s.username),
            (this.password = s.password),
            (this.accessToken = s.accessToken),
            (this.basePath = s.basePath),
            (this.withCredentials = s.withCredentials),
            (this.encoder = s.encoder),
            (this.encodeParam = s.encodeParam
              ? s.encodeParam
              : (t) => this.defaultEncodeParam(t)),
            (this.credentials = s.credentials ? s.credentials : {}),
            this.credentials.bearer ||
              (this.credentials.bearer = () =>
                'function' == typeof this.accessToken
                  ? this.accessToken()
                  : this.accessToken);
        }
        selectHeaderContentType(s) {
          if (0 === s.length) return;
          const t = s.find((n) => this.isJsonMime(n));
          return void 0 === t ? s[0] : t;
        }
        selectHeaderAccept(s) {
          if (0 === s.length) return;
          const t = s.find((n) => this.isJsonMime(n));
          return void 0 === t ? s[0] : t;
        }
        isJsonMime(s) {
          const t = new RegExp(
            '^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$',
            'i'
          );
          return (
            null !== s &&
            (t.test(s) || 'application/json-patch+json' === s.toLowerCase())
          );
        }
        lookupCredential(s) {
          const t = this.credentials[s];
          return 'function' == typeof t ? t() : t;
        }
        defaultEncodeParam(s) {
          const t =
            'date-time' === s.dataFormat && s.value instanceof Date
              ? s.value.toISOString()
              : s.value;
          return encodeURIComponent(String(t));
        }
      }
      let Dt = (() => {
        class r {
          static forRoot(t) {
            return { ngModule: r, providers: [{ provide: L, useFactory: t }] };
          }
          constructor(t, n) {
            if (t)
              throw new Error(
                'RestClientApiModule is already loaded. Import in your base AppModule only.'
              );
            if (!n)
              throw new Error(
                'You need to import the HttpClientModule in your AppModule! \nSee also https://github.com/angular/angular/issues/20575'
              );
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(r, 12), e.KVO(b.Qq, 8));
          };
          static ɵmod = e.$C({ type: r });
          static ɵinj = e.G2t({});
        }
        return r;
      })();
      var Et = m(3646);
      const lt = new e.nKC('AuthorizerURL');
      let Gt = (() => {
          class r extends Et.SX {
            authorizerURL;
            constructor(t) {
              super({
                authorizerURL: localStorage.getItem('authorizerURL') || t,
                clientID: '',
                redirectURL: window.location.origin,
              }),
                (this.authorizerURL = t);
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(lt));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        ge = (() => {
          class r {
            toModel(t) {
              return {
                old_password: t.old_password,
                new_password: t.new_password,
                confirm_new_password: t.confirm_new_password,
                picture: t.picture,
              };
            }
            toJson(t) {
              return {
                old_password: t.old_password,
                new_password: t.new_password,
                confirm_new_password: t.confirm_new_password,
                picture: t.picture,
              };
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      var C = m(1635);
      var S = m(9894),
        _ = m(7673),
        W = m(8810);
      let I = (() => {
          let r = class Fe {
            translocoService;
            constructor(t) {
              this.translocoService = t;
            }
            catchAndProcessServerError(t, n) {
              const o = t.error;
              return o?.code?.includes('VALIDATION-000')
                ? (n({ errors: o.metadata }), (0, _.of)(null))
                : (0, W.$)(() => t);
            }
            appendServerErrorsAsValidatorsToFields(t, n) {
              return (t || []).map((o) => {
                const i = n?.find((a) => a.property === o.key);
                return (
                  i &&
                    (o.validators = Object.fromEntries(
                      i.constraints.map(
                        (a) => (
                          'string' == typeof o.key &&
                            (a.description = a.description.replace(
                              o.key,
                              this.translocoService.translate(
                                'field "{{label}}"',
                                { label: o.props?.label?.toLowerCase() }
                              )
                            )),
                          [
                            'isNotEmpty' === a.name ? 'required' : a.name,
                            {
                              expression: () => !1,
                              message: () => a.description,
                            },
                          ]
                        )
                      )
                    )),
                  o
                );
              });
            }
            static ɵfac = function (n) {
              return new (n || Fe)(e.KVO(g.JO));
            };
            static ɵprov = e.jDH({
              token: Fe,
              factory: Fe.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [g.JO])],
              r
            )),
            r
          );
        })(),
        ve = (() => {
          let r = class Me {
            translocoService;
            validationService;
            constructor(t, n) {
              (this.translocoService = t), (this.validationService = n);
            }
            init() {
              return (0, _.of)(!0);
            }
            getFormlyFields(t) {
              return this.validationService.appendServerErrorsAsValidatorsToFields(
                [
                  {
                    key: 'picture',
                    type: 'image-file',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.profile-form.fields.picture'
                      ),
                      placeholder: 'picture',
                    },
                  },
                  {
                    key: 'old_password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.profile-form.fields.old-password'
                      ),
                      placeholder: 'old_password',
                      type: 'password',
                    },
                  },
                  {
                    key: 'new_password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.profile-form.fields.new-password'
                      ),
                      placeholder: 'new_password',
                      type: 'password',
                    },
                  },
                  {
                    key: 'confirm_new_password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.profile-form.fields.confirm-new-password'
                      ),
                      placeholder: 'confirm_new_password',
                      type: 'password',
                    },
                  },
                ],
                t?.errors || []
              );
            }
            static ɵfac = function (n) {
              return new (n || Me)(e.KVO(g.JO), e.KVO(I));
            };
            static ɵprov = e.jDH({
              token: Me,
              factory: Me.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [g.JO, I])],
              r
            )),
            r
          );
        })();
      var z = m(6354);
      function ie() {
        return (0, z.T)((r) => {
          const s = r.errors?.[0]?.message;
          if (s)
            throw 'unauthorized' === s
              ? new Error((0, f.x)('Unauthorized'))
              : new Error(s);
          return r.data;
        });
      }
      var T = m(4412),
        X = m(6648),
        M = m(1397),
        O = m(9437);
      const Oe = new e.nKC('AUTH_CONFIGURATION_TOKEN');
      var be = m(7786);
      let te = (() => {
          class r {
            tokens$ = new T.t(void 0);
            getRefreshToken() {
              return (
                this.tokens$.value?.refresh_token ||
                localStorage.getItem('refreshToken')
              );
            }
            getAccessToken() {
              return (
                this.tokens$.value?.access_token ||
                localStorage.getItem('accessToken')
              );
            }
            setTokens(t) {
              this.tokens$.next(t),
                t.refresh_token &&
                  localStorage.setItem('refreshToken', t.refresh_token);
            }
            getStream() {
              return (0, be.h)(
                (0, _.of)(this.tokens$.value),
                this.tokens$.asObservable()
              );
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        J = (() => {
          class r {
            tokensService;
            authConfiguration;
            authorizerService;
            profile$ = new T.t(void 0);
            constructor(t, n, o) {
              (this.tokensService = t),
                (this.authConfiguration = n),
                (this.authorizerService = o);
            }
            getAuthorizerClientID() {
              if (!this.authorizerService)
                throw new Error('this.authorizerService not set');
              return this.authorizerService.config.clientID;
            }
            setAuthorizerClientID(t) {
              if (!this.authorizerService)
                throw new Error('this.authorizerService not set');
              this.authorizerService.config.clientID = t;
            }
            signUp(t) {
              return this.authorizerService
                ? (0, X.H)(
                    this.authorizerService.signup({
                      ...t,
                      email: t.email?.toLowerCase(),
                    })
                  ).pipe(
                    ie(),
                    (0, M.Z)((n) =>
                      this.setProfileAndTokens(n).pipe(
                        (0, z.T)((o) => ({ profile: o, tokens: n }))
                      )
                    )
                  )
                : (0, W.$)(() => new Error('this.authorizerService not set'));
            }
            updateProfile(t) {
              if (!this.authorizerService)
                return (0, W.$)(
                  () => new Error('this.authorizerService not set')
                );
              const n = this.profile$.value;
              return (
                this.authConfiguration?.beforeUpdateProfile
                  ? this.authConfiguration.beforeUpdateProfile(t)
                  : (0, _.of)(t)
              ).pipe(
                (0, M.Z)((o) =>
                  this.authorizerService
                    ? (0, X.H)(
                        this.authorizerService.updateProfile(
                          { ...o },
                          this.getAuthorizationHeaders()
                        )
                      )
                    : (0, W.$)(
                        () => new Error('this.authorizerService not set')
                      )
                ),
                ie(),
                (0, M.Z)(() =>
                  this.authorizerService
                    ? this.authorizerService.getProfile(
                        this.getAuthorizationHeaders()
                      )
                    : (0, W.$)(
                        () => new Error('this.authorizerService not set')
                      )
                ),
                ie(),
                (0, M.Z)((o) => this.setProfile(o)),
                (0, M.Z)((o) =>
                  this.authConfiguration?.afterUpdateProfile
                    ? this.authConfiguration.afterUpdateProfile({
                        new: o,
                        old: n,
                      })
                    : (0, _.of)({ new: o })
                )
              );
            }
            signIn(t) {
              return this.authorizerService
                ? (0, X.H)(
                    this.authorizerService.login({
                      ...t,
                      email: t.email?.toLowerCase(),
                    })
                  ).pipe(
                    ie(),
                    (0, M.Z)((n) =>
                      this.setProfileAndTokens(n).pipe(
                        (0, z.T)((o) => ({ profile: o, tokens: n }))
                      )
                    )
                  )
                : (0, W.$)(() => new Error('this.authorizerService not set'));
            }
            signOut() {
              return this.authorizerService
                ? (0, X.H)(
                    this.authorizerService.logout(
                      this.getAuthorizationHeaders()
                    )
                  ).pipe(
                    ie(),
                    (0, M.Z)(() => this.clearProfileAndTokens())
                  )
                : (0, W.$)(() => new Error('this.authorizerService not set'));
            }
            refreshToken() {
              return this.authorizerService
                ? (0, X.H)(this.authorizerService.browserLogin()).pipe(
                    ie(),
                    (0, M.Z)((t) => this.setProfileAndTokens(t)),
                    (0, O.W)(
                      (t) => (console.error(t), this.clearProfileAndTokens())
                    )
                  )
                : (0, W.$)(() => new Error('this.authorizerService not set'));
            }
            clearProfileAndTokens() {
              return this.setProfileAndTokens({});
            }
            setProfileAndTokens(t) {
              return this.tokensService.setTokens(t), this.setProfile(t?.user);
            }
            getAuthorizationHeaders() {
              return this.authConfiguration?.getAuthorizationHeaders
                ? this.authConfiguration.getAuthorizationHeaders()
                : this.tokensService.getAccessToken()
                ? {
                    Authorization: `Bearer ${this.tokensService.getAccessToken()}`,
                  }
                : {};
            }
            setProfile(t) {
              return this.profile$.next(t), (0, _.of)(t);
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(te), e.KVO(Oe, 8), e.KVO(Gt, 8));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      var V = m(177),
        y = m(9417),
        R = m(8524),
        ct = m(8643);
      const Ve = {
        'en-US': 'MM/dd/yyyy HH:mm:ss',
        'en-GB': 'dd/MM/yyyy HH:mm:ss',
        'ar-SA': 'dd/MM/yyyy \u0647\u0647:s\u0633',
        'bg-BG': 'd.M.yyyy H:m:s \u0447.',
        'ca-ES': 'dd/MM/yyyy H:mm:ss',
        'cs-CZ': 'd.M.yyyy H:mm:ss',
        'da-DK': 'dd-MM-yyyy HH:mm:ss',
        'de-DE': 'dd.MM.yyyy HH:mm:ss',
        'el-GR': 'd/M/yyyy h:mm:ss \u03c0\u03bc|\u03bc\u03bc',
        'es-MX': 'dd/MM/yyyy H:mm:ss',
        'fi-FI': 'd.M.yyyy klo H.mm.ss',
        'fr-FR': 'dd/MM/yyyy HH:mm:ss',
        'he-IL': 'dd/MM/yyyy HH:mm:ss',
        'hi-IN': 'dd-MM-yyyy hh:mm:ss \u092c\u091c\u0947',
        'hr-HR': 'd.M.yyyy. H:mm:ss',
        'hu-HU': 'yyyy.MM.dd. H:mm:ss',
        'id-ID': 'dd/MM/yyyy HH:mm:ss',
        'is-IS': 'd.M.yyyy kl. HH:mm:ss',
        'it-IT': 'dd/MM/yyyy HH:mm:ss',
        'ja-JP': 'yyyy/MM/dd HH:mm:ss',
        'ko-KR': 'yyyy\ub144 MM\uc6d4 dd\uc77c HH\uc2dc mm\ubd84 ss\ucd08',
        'lt-LT': 'yyyy.MM.dd. HH:mm:ss',
        'lv-LV': 'yyyy.gada MM.m\u0113nesis dd.diena HH:mm:ss',
        'ms-MY': 'dd/MM/yyyy HH:mm:ss',
        'nl-NL': 'dd-MM-yyyy HH:mm:ss',
        'no-NO': 'dd.MM.yyyy HH:mm:ss',
        'pl-PL': 'dd.MM.yyyy HH:mm:ss',
        'pt-BR': 'dd/MM/yyyy HH:mm:ss',
        'ro-RO': 'dd.MM.yyyy HH:mm:ss',
        'ru-RU': 'dd.MM.yyyy HH:mm:ss',
        'sk-SK': 'd. M. yyyy H:mm:ss',
        'sl-SI': 'd.M.yyyy H:mm:ss',
        'sr-RS': 'dd.MM.yyyy. HH:mm:ss',
        'sv-SE': 'yyyy-MM-dd HH:mm:ss',
        'th-TH':
          '\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 d \u0e40\u0e14\u0e37\u0e2d\u0e19 M \u0e1b\u0e35 yyyy \u0e40\u0e27\u0e25\u0e32 H:mm:ss',
        'tr-TR': 'dd.MM.yyyy HH:mm:ss',
        'uk-UA': 'dd.MM.yyyy HH:mm:ss',
        'vi-VN': 'dd/MM/yyyy HH:mm:ss',
        'zh-CN': 'yyyy\u5e74MM\u6708dd\u65e5 HH\u65f6mm\u5206ss\u79d2',
        'zh-TW': 'yyyy\u5e74MM\u6708dd\u65e5 HH\u6642mm\u5206ss\u79d2',
      };
      var ye = m(6814),
        ce = m(1138);
      let Pe = (() => {
        class r {
          translocoService;
          translocoLocaleService;
          nzI18nService;
          langToLocaleMapping;
          constructor(t, n, o, i) {
            (this.translocoService = t),
              (this.translocoLocaleService = n),
              (this.nzI18nService = o),
              (this.langToLocaleMapping = i);
          }
          applyActiveLang(t) {
            const {
              locale: n,
              localeInSnakeCase: o,
              localeInCamelCase: i,
            } = this.normalizeLangKey(t);
            this.translocoService.setActiveLang(t),
              this.translocoLocaleService.setLocale(n),
              ce[o] && this.nzI18nService.setLocale(ce[o]),
              ye[t] && this.nzI18nService.setDateLocale(ye[t]),
              ye[i] && this.nzI18nService.setDateLocale(ye[i]);
          }
          normalizeLangKey(t) {
            const n = this.langToLocaleMapping[t],
              o = (0, g.Cb)(n),
              i = n.split('-').join('_');
            return { locale: n, localeInSnakeCase: i, localeInCamelCase: o };
          }
          static ɵfac = function (n) {
            return new (n || r)(
              e.KVO(g.JO),
              e.KVO(Q.Vv),
              e.KVO(ce.NzI18nService),
              e.KVO(Q.RR)
            );
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      const Xt = [
        {
          name: 'date-input',
          component: (() => {
            class r extends R.PU {
              translocoService;
              activeLangService;
              format$;
              constructor(t, n) {
                super(),
                  (this.translocoService = t),
                  (this.activeLangService = n),
                  (this.format$ = t.langChanges$.pipe(
                    (0, z.T)((o) => {
                      const { locale: i } =
                        this.activeLangService.normalizeLangKey(o);
                      return Ve[i] ? Ve[i] : Ve['en-US'];
                    })
                  ));
              }
              static ɵfac = function (n) {
                return new (n || r)(e.rXU(g.JO), e.rXU(Pe));
              };
              static ɵcmp = e.VBU({
                type: r,
                selectors: [['date-input']],
                features: [e.Vt3],
                decls: 2,
                vars: 6,
                consts: [
                  [
                    3,
                    'formControl',
                    'formlyAttributes',
                    'nzShowTime',
                    'nzFormat',
                  ],
                ],
                template: function (n, o) {
                  1 & n && (e.nrm(0, 'nz-date-picker', 0), e.nI1(1, 'async')),
                    2 & n &&
                      e.Y8G('formControl', o.formControl)(
                        'formlyAttributes',
                        o.field
                      )('nzShowTime', !0)('nzFormat', e.bMT(1, 4, o.format$));
                },
                dependencies: [
                  y.X1,
                  y.BC,
                  y.l_,
                  R.qy,
                  R.ch,
                  ct.LE,
                  ct.SN,
                  V.Jj,
                ],
                encapsulation: 2,
                changeDetection: 0,
              });
            }
            return r;
          })(),
          extends: 'input',
        },
      ];
      var Jt = m(4050);
      const dt = new e.nKC('SupabaseUrl'),
        ut = new e.nKC('SupabaseKey');
      function pt() {
        return (0, z.T)((r) => {
          const s = r.error?.message;
          if (s)
            throw 'unauthorized' === s
              ? new Error((0, f.x)('Unauthorized'))
              : new Error(s);
          return r.data;
        });
      }
      let ht = (() => {
        class r extends Jt.A {
          _supabaseUrl;
          _supabaseKey;
          constructor(t, n) {
            super(t, n), (this._supabaseUrl = t), (this._supabaseKey = n);
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(dt), e.KVO(ut));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      var U = m(513),
        ee = m(4781),
        E = m(1011),
        G = m(3390),
        ft = m(2170),
        mt = m(1985);
      class de {
        encodeKey(s) {
          return encodeURIComponent(s);
        }
        encodeValue(s) {
          return encodeURIComponent(s);
        }
        decodeKey(s) {
          return decodeURIComponent(s);
        }
        decodeValue(s) {
          return decodeURIComponent(s);
        }
      }
      const ue = new e.nKC('basePath');
      let gt = (() => {
        class r {
          httpClient;
          basePath = 'http://localhost';
          defaultHeaders = new b.Lr();
          configuration = new L();
          encoder;
          constructor(t, n, o) {
            if (
              ((this.httpClient = t),
              o && (this.configuration = o),
              'string' != typeof this.configuration.basePath)
            ) {
              const i = Array.isArray(n) ? n[0] : void 0;
              null != i && (n = i),
                'string' != typeof n && (n = this.basePath),
                (this.configuration.basePath = n);
            }
            this.encoder = this.configuration.encoder || new de();
          }
          addToHttpParams(t, n, o) {
            return 'object' != typeof n || n instanceof Date
              ? this.addToHttpParamsRecursive(t, n, o)
              : this.addToHttpParamsRecursive(t, n);
          }
          addToHttpParamsRecursive(t, n, o) {
            if (null == n) return t;
            if ('object' == typeof n)
              if (Array.isArray(n))
                n.forEach((i) => (t = this.addToHttpParamsRecursive(t, i, o)));
              else if (n instanceof Date) {
                if (null == o)
                  throw Error('key may not be null if value is Date');
                t = t.append(o, n.toISOString().substring(0, 10));
              } else
                Object.keys(n).forEach(
                  (i) =>
                    (t = this.addToHttpParamsRecursive(
                      t,
                      n[i],
                      null != o ? `${o}.${i}` : i
                    ))
                );
            else {
              if (null == o)
                throw Error(
                  'key may not be null if value is not object or array'
                );
              t = t.append(o, n);
            }
            return t;
          }
          filesControllerDeleteFile(t, n = 'body', o = !1, i) {
            if (null == t)
              throw new Error(
                'Required parameter downloadUrl was null or undefined when calling filesControllerDeleteFile.'
              );
            let a = new b.Nl({ encoder: this.encoder });
            null != t && (a = this.addToHttpParams(a, t, 'downloadUrl'));
            let l = this.defaultHeaders,
              c = i && i.httpHeaderAccept;
            void 0 === c &&
              (c = this.configuration.selectHeaderAccept(['application/json'])),
              void 0 !== c && (l = l.set('Accept', c));
            let d = i && i.context;
            void 0 === d && (d = new b._y());
            let u = i && i.transferCache;
            void 0 === u && (u = !0);
            let p = 'json';
            return (
              c &&
                (p = c.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(c)
                  ? 'json'
                  : 'blob'),
              this.httpClient.request(
                'post',
                `${this.configuration.basePath}/api/files/delete-file`,
                {
                  context: d,
                  params: a,
                  responseType: p,
                  withCredentials: this.configuration.withCredentials,
                  headers: l,
                  observe: n,
                  transferCache: u,
                  reportProgress: o,
                }
              )
            );
          }
          filesControllerGetPresignedUrl(t, n = 'body', o = !1, i) {
            if (null == t)
              throw new Error(
                'Required parameter ext was null or undefined when calling filesControllerGetPresignedUrl.'
              );
            let a = new b.Nl({ encoder: this.encoder });
            null != t && (a = this.addToHttpParams(a, t, 'ext'));
            let l = this.defaultHeaders,
              c = i && i.httpHeaderAccept;
            void 0 === c &&
              (c = this.configuration.selectHeaderAccept(['application/json'])),
              void 0 !== c && (l = l.set('Accept', c));
            let d = i && i.context;
            void 0 === d && (d = new b._y());
            let u = i && i.transferCache;
            void 0 === u && (u = !0);
            let p = 'json';
            return (
              c &&
                (p = c.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(c)
                  ? 'json'
                  : 'blob'),
              this.httpClient.request(
                'get',
                `${this.configuration.basePath}/api/files/get-presigned-url`,
                {
                  context: d,
                  params: a,
                  responseType: p,
                  withCredentials: this.configuration.withCredentials,
                  headers: l,
                  observe: n,
                  transferCache: u,
                  reportProgress: o,
                }
              )
            );
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(b.Qq), e.KVO(ue, 8), e.KVO(L, 8));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      const vt = new e.nKC('MinioURL');
      let bt = (() => {
        class r {
          minioURL;
          filesRestService;
          constructor(t, n) {
            (this.minioURL = t), (this.filesRestService = n);
          }
          getPresignedUrlAndUploadFile(t) {
            return t
              ? 'string' != typeof t
                ? this.getPresignedUrl(t).pipe(
                    (0, M.Z)((n) =>
                      this.uploadFile({ file: t, presignedUrls: n })
                    ),
                    (0, z.T)((n) => n.downloadUrl)
                  )
                : (0, _.of)(t)
              : (0, _.of)('');
          }
          getPresignedUrl(t) {
            return (0, X.H)(
              this.filesRestService.filesControllerGetPresignedUrl(
                this.getFileExt(t)
              )
            );
          }
          uploadFile({ file: t, presignedUrls: n }) {
            return new mt.c((o) => {
              const i = { downloadUrl: n.downloadUrl, uploadUrl: n.uploadUrl };
              if (n.uploadUrl) {
                const a = new XMLHttpRequest();
                a.open('PUT', i.uploadUrl),
                  (a.onreadystatechange = () => {
                    4 === a.readyState &&
                      (200 === a.status
                        ? (o.next(i), o.complete())
                        : o.error(new Error('Error in upload file')));
                  }),
                  a.send(t);
              } else o.next(i), o.complete();
            });
          }
          deleteFile(t) {
            return (0, X.H)(this.filesRestService.filesControllerDeleteFile(t));
          }
          openTargetURI(t) {
            if (this.isIOS()) document.location.href = t;
            else {
              const n = document.createElement('a');
              (n.target = '_blank'),
                (n.href = t),
                document.body.appendChild(n),
                n.click(),
                document.body.removeChild(n);
            }
          }
          getFileExt(t) {
            return t?.type?.split('/')?.[1].toLowerCase();
          }
          isIOS() {
            return (
              [
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod',
              ].includes(navigator.platform) ||
              (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
            );
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(vt), e.KVO(gt));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      var q = m(6389),
        Z = m(5930);
      const Yt = [
        {
          name: 'image-file',
          component: (() => {
            class r extends R.PU {
              filesService;
              fileList$ = new T.t([]);
              title$ = new T.t('');
              icon$ = new T.t('');
              constructor(t) {
                super(), (this.filesService = t);
              }
              ngOnInit() {
                this.formControl.value
                  ? (this.switchToReloadMode(),
                    this.fileList$.next([
                      {
                        uid: this.formControl.value,
                        name: this.formControl.value.split('/').at(-1),
                        status: 'done',
                        url: this.formControl.value,
                      },
                    ]))
                  : this.switchToUploadMode();
              }
              onFileListChange(t) {
                0 === t.length &&
                  (this.formControl.setValue(null),
                  this.fileList$.next([]),
                  this.switchToUploadMode());
              }
              beforeUpload = (t) => (
                this.formControl.setValue(t),
                this.switchToReloadMode(),
                this.fileList$.next([t]),
                !1
              );
              switchToReloadMode() {
                this.icon$.next('reload'),
                  this.title$.next((0, f.x)('files.image-file.change-file'));
              }
              switchToUploadMode() {
                this.icon$.next('upload'),
                  this.title$.next((0, f.x)('files.image-file.select-file'));
              }
              static ɵfac = function (n) {
                return new (n || r)(e.rXU(bt));
              };
              static ɵcmp = e.VBU({
                type: r,
                selectors: [['image-file']],
                features: [e.Vt3],
                decls: 8,
                vars: 15,
                consts: [
                  [
                    3,
                    'nzFileListChange',
                    'nzAccept',
                    'nzListType',
                    'nzFileList',
                    'nzLimit',
                    'nzBeforeUpload',
                  ],
                  ['nz-button', '', 'type', 'button'],
                  ['nz-icon', '', 3, 'nzType'],
                ],
                template: function (n, o) {
                  1 & n &&
                    (e.j41(0, 'nz-upload', 0),
                    e.nI1(1, 'async'),
                    e.bIt('nzFileListChange', function (a) {
                      return o.onFileListChange(a);
                    }),
                    e.j41(2, 'button', 1),
                    e.nrm(3, 'span', 2),
                    e.nI1(4, 'async'),
                    e.EFF(5),
                    e.nI1(6, 'async'),
                    e.nI1(7, 'transloco'),
                    e.k0s()()),
                    2 & n &&
                      (e.Y8G('nzAccept', 'image/png, image/jpeg')(
                        'nzListType',
                        'picture'
                      )('nzFileList', e.bMT(1, 7, o.fileList$))('nzLimit', 1)(
                        'nzBeforeUpload',
                        o.beforeUpload
                      ),
                      e.R7$(3),
                      e.Y8G('nzType', e.bMT(4, 9, o.icon$)),
                      e.R7$(2),
                      e.SpI(' ', e.bMT(7, 13, e.bMT(6, 11, o.title$)), ' '));
                },
                dependencies: [
                  y.X1,
                  R.qy,
                  E.j,
                  U.Zw,
                  U.aO,
                  q.c,
                  Z.p,
                  ft.SE,
                  ft.$W,
                  G.U6,
                  ee.Y3,
                  ee.Dn,
                  V.Jj,
                  g.Kj,
                ],
                encapsulation: 2,
                changeDetection: 0,
              });
            }
            return r;
          })(),
          extends: 'input',
        },
      ];
      class qt {
        webhookSuperAdminExternalUserId;
        constructor(s) {
          Object.assign(this, s);
        }
      }
      const Zt = new e.nKC('WEBHOOK_CONFIGURATION_TOKEN');
      var Qt = m(874);
      const yt = 'https://gustcjgbrmmipkizqzso.supabase.co',
        St =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1c3Rjamdicm1taXBraXpxenNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMTIzMjEsImV4cCI6MjA1MTU4ODMyMX0.GKguijZ5Pqxx0g3R1ey6XaCjBica6DSjEv5jvTUMHYo';
      var k = m(8141);
      let Se = (() => {
          class r {
            httpClient;
            basePath = 'http://localhost';
            defaultHeaders = new b.Lr();
            configuration = new L();
            encoder;
            constructor(t, n, o) {
              if (
                ((this.httpClient = t),
                o && (this.configuration = o),
                'string' != typeof this.configuration.basePath)
              ) {
                const i = Array.isArray(n) ? n[0] : void 0;
                null != i && (n = i),
                  'string' != typeof n && (n = this.basePath),
                  (this.configuration.basePath = n);
              }
              this.encoder = this.configuration.encoder || new de();
            }
            addToHttpParams(t, n, o) {
              return 'object' != typeof n || n instanceof Date
                ? this.addToHttpParamsRecursive(t, n, o)
                : this.addToHttpParamsRecursive(t, n);
            }
            addToHttpParamsRecursive(t, n, o) {
              if (null == n) return t;
              if ('object' == typeof n)
                if (Array.isArray(n))
                  n.forEach(
                    (i) => (t = this.addToHttpParamsRecursive(t, i, o))
                  );
                else if (n instanceof Date) {
                  if (null == o)
                    throw Error('key may not be null if value is Date');
                  t = t.append(o, n.toISOString().substring(0, 10));
                } else
                  Object.keys(n).forEach(
                    (i) =>
                      (t = this.addToHttpParamsRecursive(
                        t,
                        n[i],
                        null != o ? `${o}.${i}` : i
                      ))
                  );
              else {
                if (null == o)
                  throw Error(
                    'key may not be null if value is not object or array'
                  );
                t = t.append(o, n);
              }
              return t;
            }
            appControllerDemoCreateOne(t = 'body', n = !1, o) {
              let i = this.defaultHeaders,
                a = o && o.httpHeaderAccept;
              void 0 === a &&
                (a = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== a && (i = i.set('Accept', a));
              let l = o && o.context;
              void 0 === l && (l = new b._y());
              let c = o && o.transferCache;
              void 0 === c && (c = !0);
              let d = 'json';
              return (
                a &&
                  (d = a.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(a)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'post',
                  `${this.configuration.basePath}/api/demo`,
                  {
                    context: l,
                    responseType: d,
                    withCredentials: this.configuration.withCredentials,
                    headers: i,
                    observe: t,
                    transferCache: c,
                    reportProgress: n,
                  }
                )
              );
            }
            appControllerDemoDeleteOne(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling appControllerDemoDeleteOne.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              let u = 'json';
              l &&
                (u = l.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(l)
                  ? 'json'
                  : 'blob');
              let p = `/api/demo/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'delete',
                `${this.configuration.basePath}${p}`,
                {
                  context: c,
                  responseType: u,
                  withCredentials: this.configuration.withCredentials,
                  headers: a,
                  observe: n,
                  transferCache: d,
                  reportProgress: o,
                }
              );
            }
            appControllerDemoFindMany(t = 'body', n = !1, o) {
              let i = this.defaultHeaders,
                a = o && o.httpHeaderAccept;
              void 0 === a &&
                (a = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== a && (i = i.set('Accept', a));
              let l = o && o.context;
              void 0 === l && (l = new b._y());
              let c = o && o.transferCache;
              void 0 === c && (c = !0);
              let d = 'json';
              return (
                a &&
                  (d = a.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(a)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/demo`,
                  {
                    context: l,
                    responseType: d,
                    withCredentials: this.configuration.withCredentials,
                    headers: i,
                    observe: t,
                    transferCache: c,
                    reportProgress: n,
                  }
                )
              );
            }
            appControllerDemoFindOne(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling appControllerDemoFindOne.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              let u = 'json';
              l &&
                (u = l.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(l)
                  ? 'json'
                  : 'blob');
              let p = `/api/demo/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'get',
                `${this.configuration.basePath}${p}`,
                {
                  context: c,
                  responseType: u,
                  withCredentials: this.configuration.withCredentials,
                  headers: a,
                  observe: n,
                  transferCache: d,
                  reportProgress: o,
                }
              );
            }
            appControllerDemoUpdateOne(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling appControllerDemoUpdateOne.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              let u = 'json';
              l &&
                (u = l.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(l)
                  ? 'json'
                  : 'blob');
              let p = `/api/demo/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'put',
                `${this.configuration.basePath}${p}`,
                {
                  context: c,
                  responseType: u,
                  withCredentials: this.configuration.withCredentials,
                  headers: a,
                  observe: n,
                  transferCache: d,
                  reportProgress: o,
                }
              );
            }
            appControllerGetData(t = 'body', n = !1, o) {
              let i = this.defaultHeaders,
                a = o && o.httpHeaderAccept;
              void 0 === a &&
                (a = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== a && (i = i.set('Accept', a));
              let l = o && o.context;
              void 0 === l && (l = new b._y());
              let c = o && o.transferCache;
              void 0 === c && (c = !0);
              let d = 'json';
              return (
                a &&
                  (d = a.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(a)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/get-data`,
                  {
                    context: l,
                    responseType: d,
                    withCredentials: this.configuration.withCredentials,
                    headers: i,
                    observe: t,
                    transferCache: c,
                    reportProgress: n,
                  }
                )
              );
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(b.Qq), e.KVO(ue, 8), e.KVO(L, 8));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        se = (() => {
          class r {
            httpClient;
            basePath = 'http://localhost';
            defaultHeaders = new b.Lr();
            configuration = new L();
            encoder;
            constructor(t, n, o) {
              if (
                ((this.httpClient = t),
                o && (this.configuration = o),
                'string' != typeof this.configuration.basePath)
              ) {
                const i = Array.isArray(n) ? n[0] : void 0;
                null != i && (n = i),
                  'string' != typeof n && (n = this.basePath),
                  (this.configuration.basePath = n);
              }
              this.encoder = this.configuration.encoder || new de();
            }
            addToHttpParams(t, n, o) {
              return 'object' != typeof n || n instanceof Date
                ? this.addToHttpParamsRecursive(t, n, o)
                : this.addToHttpParamsRecursive(t, n);
            }
            addToHttpParamsRecursive(t, n, o) {
              if (null == n) return t;
              if ('object' == typeof n)
                if (Array.isArray(n))
                  n.forEach(
                    (i) => (t = this.addToHttpParamsRecursive(t, i, o))
                  );
                else if (n instanceof Date) {
                  if (null == o)
                    throw Error('key may not be null if value is Date');
                  t = t.append(o, n.toISOString().substring(0, 10));
                } else
                  Object.keys(n).forEach(
                    (i) =>
                      (t = this.addToHttpParamsRecursive(
                        t,
                        n[i],
                        null != o ? `${o}.${i}` : i
                      ))
                  );
              else {
                if (null == o)
                  throw Error(
                    'key may not be null if value is not object or array'
                  );
                t = t.append(o, n);
              }
              return t;
            }
            webhookControllerCreateOne(t, n, o, i = 'body', a = !1, l) {
              if (null == t)
                throw new Error(
                  'Required parameter createWebhookDtoInterface was null or undefined when calling webhookControllerCreateOne.'
                );
              let c = this.defaultHeaders;
              null != n && (c = c.set('x-external-user-id', String(n))),
                null != o && (c = c.set('x-external-tenant-id', String(o)));
              let d = l && l.httpHeaderAccept;
              void 0 === d &&
                (d = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== d && (c = c.set('Accept', d));
              let u = l && l.context;
              void 0 === u && (u = new b._y());
              let p = l && l.transferCache;
              void 0 === p && (p = !0);
              const v = this.configuration.selectHeaderContentType([
                'application/json',
              ]);
              void 0 !== v && (c = c.set('Content-Type', v));
              let w = 'json';
              return (
                d &&
                  (w = d.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(d)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'post',
                  `${this.configuration.basePath}/api/webhook`,
                  {
                    context: u,
                    body: t,
                    responseType: w,
                    withCredentials: this.configuration.withCredentials,
                    headers: c,
                    observe: i,
                    transferCache: p,
                    reportProgress: a,
                  }
                )
              );
            }
            webhookControllerDeleteOne(t, n, o, i = 'body', a = !1, l) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookControllerDeleteOne.'
                );
              let c = this.defaultHeaders;
              null != n && (c = c.set('x-external-user-id', String(n))),
                null != o && (c = c.set('x-external-tenant-id', String(o)));
              let d = l && l.httpHeaderAccept;
              void 0 === d &&
                (d = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== d && (c = c.set('Accept', d));
              let u = l && l.context;
              void 0 === u && (u = new b._y());
              let p = l && l.transferCache;
              void 0 === p && (p = !0);
              let h = 'json';
              d &&
                (h = d.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(d)
                  ? 'json'
                  : 'blob');
              let v = `/api/webhook/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'delete',
                `${this.configuration.basePath}${v}`,
                {
                  context: u,
                  responseType: h,
                  withCredentials: this.configuration.withCredentials,
                  headers: c,
                  observe: i,
                  transferCache: p,
                  reportProgress: a,
                }
              );
            }
            webhookControllerEvents(t, n, o = 'body', i = !1, a) {
              let l = this.defaultHeaders;
              null != t && (l = l.set('x-external-user-id', String(t))),
                null != n && (l = l.set('x-external-tenant-id', String(n)));
              let c = a && a.httpHeaderAccept;
              void 0 === c &&
                (c = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== c && (l = l.set('Accept', c));
              let d = a && a.context;
              void 0 === d && (d = new b._y());
              let u = a && a.transferCache;
              void 0 === u && (u = !0);
              let p = 'json';
              return (
                c &&
                  (p = c.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(c)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/webhook/events`,
                  {
                    context: d,
                    responseType: p,
                    withCredentials: this.configuration.withCredentials,
                    headers: l,
                    observe: o,
                    transferCache: u,
                    reportProgress: i,
                  }
                )
              );
            }
            webhookControllerFindMany(t, n, o, i, a, l, c = 'body', d = !1, u) {
              let p = new b.Nl({ encoder: this.encoder });
              null != o && (p = this.addToHttpParams(p, o, 'curPage')),
                null != i && (p = this.addToHttpParams(p, i, 'perPage')),
                null != a && (p = this.addToHttpParams(p, a, 'searchText')),
                null != l && (p = this.addToHttpParams(p, l, 'sort'));
              let h = this.defaultHeaders;
              null != t && (h = h.set('x-external-user-id', String(t))),
                null != n && (h = h.set('x-external-tenant-id', String(n)));
              let v = u && u.httpHeaderAccept;
              void 0 === v &&
                (v = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== v && (h = h.set('Accept', v));
              let w = u && u.context;
              void 0 === w && (w = new b._y());
              let A = u && u.transferCache;
              void 0 === A && (A = !0);
              let x = 'json';
              return (
                v &&
                  (x = v.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(v)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/webhook`,
                  {
                    context: w,
                    params: p,
                    responseType: x,
                    withCredentials: this.configuration.withCredentials,
                    headers: h,
                    observe: c,
                    transferCache: A,
                    reportProgress: d,
                  }
                )
              );
            }
            webhookControllerFindManyLogs(
              t,
              n,
              o,
              i,
              a,
              l,
              c,
              d = 'body',
              u = !1,
              p
            ) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookControllerFindManyLogs.'
                );
              let h = new b.Nl({ encoder: this.encoder });
              null != i && (h = this.addToHttpParams(h, i, 'curPage')),
                null != a && (h = this.addToHttpParams(h, a, 'perPage')),
                null != l && (h = this.addToHttpParams(h, l, 'searchText')),
                null != c && (h = this.addToHttpParams(h, c, 'sort'));
              let v = this.defaultHeaders;
              null != n && (v = v.set('x-external-user-id', String(n))),
                null != o && (v = v.set('x-external-tenant-id', String(o)));
              let w = p && p.httpHeaderAccept;
              void 0 === w &&
                (w = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== w && (v = v.set('Accept', w));
              let A = p && p.context;
              void 0 === A && (A = new b._y());
              let x = p && p.transferCache;
              void 0 === x && (x = !0);
              let Y = 'json';
              w &&
                (Y = w.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(w)
                  ? 'json'
                  : 'blob');
              let fe = `/api/webhook/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}/logs`;
              return this.httpClient.request(
                'get',
                `${this.configuration.basePath}${fe}`,
                {
                  context: A,
                  params: h,
                  responseType: Y,
                  withCredentials: this.configuration.withCredentials,
                  headers: v,
                  observe: d,
                  transferCache: x,
                  reportProgress: u,
                }
              );
            }
            webhookControllerFindOne(t, n, o, i = 'body', a = !1, l) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookControllerFindOne.'
                );
              let c = this.defaultHeaders;
              null != n && (c = c.set('x-external-user-id', String(n))),
                null != o && (c = c.set('x-external-tenant-id', String(o)));
              let d = l && l.httpHeaderAccept;
              void 0 === d &&
                (d = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== d && (c = c.set('Accept', d));
              let u = l && l.context;
              void 0 === u && (u = new b._y());
              let p = l && l.transferCache;
              void 0 === p && (p = !0);
              let h = 'json';
              d &&
                (h = d.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(d)
                  ? 'json'
                  : 'blob');
              let v = `/api/webhook/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'get',
                `${this.configuration.basePath}${v}`,
                {
                  context: u,
                  responseType: h,
                  withCredentials: this.configuration.withCredentials,
                  headers: c,
                  observe: i,
                  transferCache: p,
                  reportProgress: a,
                }
              );
            }
            webhookControllerProfile(t, n, o = 'body', i = !1, a) {
              let l = this.defaultHeaders;
              null != t && (l = l.set('x-external-user-id', String(t))),
                null != n && (l = l.set('x-external-tenant-id', String(n)));
              let c = a && a.httpHeaderAccept;
              void 0 === c &&
                (c = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== c && (l = l.set('Accept', c));
              let d = a && a.context;
              void 0 === d && (d = new b._y());
              let u = a && a.transferCache;
              void 0 === u && (u = !0);
              let p = 'json';
              return (
                c &&
                  (p = c.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(c)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/webhook/profile`,
                  {
                    context: d,
                    responseType: p,
                    withCredentials: this.configuration.withCredentials,
                    headers: l,
                    observe: o,
                    transferCache: u,
                    reportProgress: i,
                  }
                )
              );
            }
            webhookControllerUpdateOne(t, n, o, i, a = 'body', l = !1, c) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookControllerUpdateOne.'
                );
              if (null == n)
                throw new Error(
                  'Required parameter updateWebhookDtoInterface was null or undefined when calling webhookControllerUpdateOne.'
                );
              let d = this.defaultHeaders;
              null != o && (d = d.set('x-external-user-id', String(o))),
                null != i && (d = d.set('x-external-tenant-id', String(i)));
              let u = c && c.httpHeaderAccept;
              void 0 === u &&
                (u = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== u && (d = d.set('Accept', u));
              let p = c && c.context;
              void 0 === p && (p = new b._y());
              let h = c && c.transferCache;
              void 0 === h && (h = !0);
              const w = this.configuration.selectHeaderContentType([
                'application/json',
              ]);
              void 0 !== w && (d = d.set('Content-Type', w));
              let A = 'json';
              u &&
                (A = u.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(u)
                  ? 'json'
                  : 'blob');
              let x = `/api/webhook/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'put',
                `${this.configuration.basePath}${x}`,
                {
                  context: p,
                  body: n,
                  responseType: A,
                  withCredentials: this.configuration.withCredentials,
                  headers: d,
                  observe: a,
                  transferCache: h,
                  reportProgress: l,
                }
              );
            }
            webhookUsersControllerDeleteOne(t, n, o, i = 'body', a = !1, l) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookUsersControllerDeleteOne.'
                );
              let c = this.defaultHeaders;
              null != n && (c = c.set('x-external-user-id', String(n))),
                null != o && (c = c.set('x-external-tenant-id', String(o)));
              let d = l && l.httpHeaderAccept;
              void 0 === d &&
                (d = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== d && (c = c.set('Accept', d));
              let u = l && l.context;
              void 0 === u && (u = new b._y());
              let p = l && l.transferCache;
              void 0 === p && (p = !0);
              let h = 'json';
              d &&
                (h = d.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(d)
                  ? 'json'
                  : 'blob');
              let v = `/api/webhook/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'delete',
                `${this.configuration.basePath}${v}`,
                {
                  context: u,
                  responseType: h,
                  withCredentials: this.configuration.withCredentials,
                  headers: c,
                  observe: i,
                  transferCache: p,
                  reportProgress: a,
                }
              );
            }
            webhookUsersControllerFindMany(
              t,
              n,
              o,
              i,
              a,
              l,
              c = 'body',
              d = !1,
              u
            ) {
              let p = new b.Nl({ encoder: this.encoder });
              null != o && (p = this.addToHttpParams(p, o, 'curPage')),
                null != i && (p = this.addToHttpParams(p, i, 'perPage')),
                null != a && (p = this.addToHttpParams(p, a, 'searchText')),
                null != l && (p = this.addToHttpParams(p, l, 'sort'));
              let h = this.defaultHeaders;
              null != t && (h = h.set('x-external-user-id', String(t))),
                null != n && (h = h.set('x-external-tenant-id', String(n)));
              let v = u && u.httpHeaderAccept;
              void 0 === v &&
                (v = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== v && (h = h.set('Accept', v));
              let w = u && u.context;
              void 0 === w && (w = new b._y());
              let A = u && u.transferCache;
              void 0 === A && (A = !0);
              let x = 'json';
              return (
                v &&
                  (x = v.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(v)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/webhook/users`,
                  {
                    context: w,
                    params: p,
                    responseType: x,
                    withCredentials: this.configuration.withCredentials,
                    headers: h,
                    observe: c,
                    transferCache: A,
                    reportProgress: d,
                  }
                )
              );
            }
            webhookUsersControllerFindOne(t, n, o, i = 'body', a = !1, l) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookUsersControllerFindOne.'
                );
              let c = this.defaultHeaders;
              null != n && (c = c.set('x-external-user-id', String(n))),
                null != o && (c = c.set('x-external-tenant-id', String(o)));
              let d = l && l.httpHeaderAccept;
              void 0 === d &&
                (d = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== d && (c = c.set('Accept', d));
              let u = l && l.context;
              void 0 === u && (u = new b._y());
              let p = l && l.transferCache;
              void 0 === p && (p = !0);
              let h = 'json';
              d &&
                (h = d.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(d)
                  ? 'json'
                  : 'blob');
              let v = `/api/webhook/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'get',
                `${this.configuration.basePath}${v}`,
                {
                  context: u,
                  responseType: h,
                  withCredentials: this.configuration.withCredentials,
                  headers: c,
                  observe: i,
                  transferCache: p,
                  reportProgress: a,
                }
              );
            }
            webhookUsersControllerUpdateOne(t, n, o, i, a = 'body', l = !1, c) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling webhookUsersControllerUpdateOne.'
                );
              if (null == n)
                throw new Error(
                  'Required parameter updateWebhookUserDtoInterface was null or undefined when calling webhookUsersControllerUpdateOne.'
                );
              let d = this.defaultHeaders;
              null != o && (d = d.set('x-external-user-id', String(o))),
                null != i && (d = d.set('x-external-tenant-id', String(i)));
              let u = c && c.httpHeaderAccept;
              void 0 === u &&
                (u = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== u && (d = d.set('Accept', u));
              let p = c && c.context;
              void 0 === p && (p = new b._y());
              let h = c && c.transferCache;
              void 0 === h && (h = !0);
              const w = this.configuration.selectHeaderContentType([
                'application/json',
              ]);
              void 0 !== w && (d = d.set('Content-Type', w));
              let A = 'json';
              u &&
                (A = u.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(u)
                  ? 'json'
                  : 'blob');
              let x = `/api/webhook/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'put',
                `${this.configuration.basePath}${x}`,
                {
                  context: p,
                  body: n,
                  responseType: A,
                  withCredentials: this.configuration.withCredentials,
                  headers: d,
                  observe: a,
                  transferCache: h,
                  reportProgress: l,
                }
              );
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(b.Qq), e.KVO(ue, 8), e.KVO(L, 8));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        Re = (() => {
          class r {
            httpClient;
            basePath = 'http://localhost';
            defaultHeaders = new b.Lr();
            configuration = new L();
            encoder;
            constructor(t, n, o) {
              if (
                ((this.httpClient = t),
                o && (this.configuration = o),
                'string' != typeof this.configuration.basePath)
              ) {
                const i = Array.isArray(n) ? n[0] : void 0;
                null != i && (n = i),
                  'string' != typeof n && (n = this.basePath),
                  (this.configuration.basePath = n);
              }
              this.encoder = this.configuration.encoder || new de();
            }
            addToHttpParams(t, n, o) {
              return 'object' != typeof n || n instanceof Date
                ? this.addToHttpParamsRecursive(t, n, o)
                : this.addToHttpParamsRecursive(t, n);
            }
            addToHttpParamsRecursive(t, n, o) {
              if (null == n) return t;
              if ('object' == typeof n)
                if (Array.isArray(n))
                  n.forEach(
                    (i) => (t = this.addToHttpParamsRecursive(t, i, o))
                  );
                else if (n instanceof Date) {
                  if (null == o)
                    throw Error('key may not be null if value is Date');
                  t = t.append(o, n.toISOString().substring(0, 10));
                } else
                  Object.keys(n).forEach(
                    (i) =>
                      (t = this.addToHttpParamsRecursive(
                        t,
                        n[i],
                        null != o ? `${o}.${i}` : i
                      ))
                  );
              else {
                if (null == o)
                  throw Error(
                    'key may not be null if value is not object or array'
                  );
                t = t.append(o, n);
              }
              return t;
            }
            timeControllerTime(t = 'body', n = !1, o) {
              let i = this.defaultHeaders,
                a = o && o.httpHeaderAccept;
              void 0 === a &&
                (a = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== a && (i = i.set('Accept', a));
              let l = o && o.context;
              void 0 === l && (l = new b._y());
              let c = o && o.transferCache;
              void 0 === c && (c = !0);
              let d = 'json';
              return (
                a &&
                  (d = a.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(a)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/time`,
                  {
                    context: l,
                    responseType: d,
                    withCredentials: this.configuration.withCredentials,
                    headers: i,
                    observe: t,
                    transferCache: c,
                    reportProgress: n,
                  }
                )
              );
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(b.Qq), e.KVO(ue, 8), e.KVO(L, 8));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        we = (() => {
          class r {
            httpClient;
            basePath = 'http://localhost';
            defaultHeaders = new b.Lr();
            configuration = new L();
            encoder;
            constructor(t, n, o) {
              if (
                ((this.httpClient = t),
                o && (this.configuration = o),
                'string' != typeof this.configuration.basePath)
              ) {
                const i = Array.isArray(n) ? n[0] : void 0;
                null != i && (n = i),
                  'string' != typeof n && (n = this.basePath),
                  (this.configuration.basePath = n);
              }
              this.encoder = this.configuration.encoder || new de();
            }
            addToHttpParams(t, n, o) {
              return 'object' != typeof n || n instanceof Date
                ? this.addToHttpParamsRecursive(t, n, o)
                : this.addToHttpParamsRecursive(t, n);
            }
            addToHttpParamsRecursive(t, n, o) {
              if (null == n) return t;
              if ('object' == typeof n)
                if (Array.isArray(n))
                  n.forEach(
                    (i) => (t = this.addToHttpParamsRecursive(t, i, o))
                  );
                else if (n instanceof Date) {
                  if (null == o)
                    throw Error('key may not be null if value is Date');
                  t = t.append(o, n.toISOString().substring(0, 10));
                } else
                  Object.keys(n).forEach(
                    (i) =>
                      (t = this.addToHttpParamsRecursive(
                        t,
                        n[i],
                        null != o ? `${o}.${i}` : i
                      ))
                  );
              else {
                if (null == o)
                  throw Error(
                    'key may not be null if value is not object or array'
                  );
                t = t.append(o, n);
              }
              return t;
            }
            authControllerProfile(t = 'body', n = !1, o) {
              let i = this.defaultHeaders,
                a = o && o.httpHeaderAccept;
              void 0 === a &&
                (a = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== a && (i = i.set('Accept', a));
              let l = o && o.context;
              void 0 === l && (l = new b._y());
              let c = o && o.transferCache;
              void 0 === c && (c = !0);
              let d = 'json';
              return (
                a &&
                  (d = a.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(a)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/auth/profile`,
                  {
                    context: l,
                    responseType: d,
                    withCredentials: this.configuration.withCredentials,
                    headers: i,
                    observe: t,
                    transferCache: c,
                    reportProgress: n,
                  }
                )
              );
            }
            authControllerUpdateProfile(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter authProfileDtoInterface was null or undefined when calling authControllerUpdateProfile.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              const p = this.configuration.selectHeaderContentType([
                'application/json',
              ]);
              void 0 !== p && (a = a.set('Content-Type', p));
              let h = 'json';
              return (
                l &&
                  (h = l.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(l)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'post',
                  `${this.configuration.basePath}/api/auth/update-profile`,
                  {
                    context: c,
                    body: t,
                    responseType: h,
                    withCredentials: this.configuration.withCredentials,
                    headers: a,
                    observe: n,
                    transferCache: d,
                    reportProgress: o,
                  }
                )
              );
            }
            authUsersControllerDeleteOne(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling authUsersControllerDeleteOne.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              let u = 'json';
              l &&
                (u = l.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(l)
                  ? 'json'
                  : 'blob');
              let p = `/api/auth/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'delete',
                `${this.configuration.basePath}${p}`,
                {
                  context: c,
                  responseType: u,
                  withCredentials: this.configuration.withCredentials,
                  headers: a,
                  observe: n,
                  transferCache: d,
                  reportProgress: o,
                }
              );
            }
            authUsersControllerFindMany(t, n, o, i, a = 'body', l = !1, c) {
              let d = new b.Nl({ encoder: this.encoder });
              null != t && (d = this.addToHttpParams(d, t, 'curPage')),
                null != n && (d = this.addToHttpParams(d, n, 'perPage')),
                null != o && (d = this.addToHttpParams(d, o, 'searchText')),
                null != i && (d = this.addToHttpParams(d, i, 'sort'));
              let u = this.defaultHeaders,
                p = c && c.httpHeaderAccept;
              void 0 === p &&
                (p = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== p && (u = u.set('Accept', p));
              let h = c && c.context;
              void 0 === h && (h = new b._y());
              let v = c && c.transferCache;
              void 0 === v && (v = !0);
              let w = 'json';
              return (
                p &&
                  (w = p.startsWith('text')
                    ? 'text'
                    : this.configuration.isJsonMime(p)
                    ? 'json'
                    : 'blob'),
                this.httpClient.request(
                  'get',
                  `${this.configuration.basePath}/api/auth/users`,
                  {
                    context: h,
                    params: d,
                    responseType: w,
                    withCredentials: this.configuration.withCredentials,
                    headers: u,
                    observe: a,
                    transferCache: v,
                    reportProgress: l,
                  }
                )
              );
            }
            authUsersControllerFindOne(t, n = 'body', o = !1, i) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling authUsersControllerFindOne.'
                );
              let a = this.defaultHeaders,
                l = i && i.httpHeaderAccept;
              void 0 === l &&
                (l = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== l && (a = a.set('Accept', l));
              let c = i && i.context;
              void 0 === c && (c = new b._y());
              let d = i && i.transferCache;
              void 0 === d && (d = !0);
              let u = 'json';
              l &&
                (u = l.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(l)
                  ? 'json'
                  : 'blob');
              let p = `/api/auth/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'get',
                `${this.configuration.basePath}${p}`,
                {
                  context: c,
                  responseType: u,
                  withCredentials: this.configuration.withCredentials,
                  headers: a,
                  observe: n,
                  transferCache: d,
                  reportProgress: o,
                }
              );
            }
            authUsersControllerUpdateOne(t, n, o = 'body', i = !1, a) {
              if (null == t)
                throw new Error(
                  'Required parameter id was null or undefined when calling authUsersControllerUpdateOne.'
                );
              if (null == n)
                throw new Error(
                  'Required parameter updateAuthUserDtoInterface was null or undefined when calling authUsersControllerUpdateOne.'
                );
              let l = this.defaultHeaders,
                c = a && a.httpHeaderAccept;
              void 0 === c &&
                (c = this.configuration.selectHeaderAccept([
                  'application/json',
                ])),
                void 0 !== c && (l = l.set('Accept', c));
              let d = a && a.context;
              void 0 === d && (d = new b._y());
              let u = a && a.transferCache;
              void 0 === u && (u = !0);
              const h = this.configuration.selectHeaderContentType([
                'application/json',
              ]);
              void 0 !== h && (l = l.set('Content-Type', h));
              let v = 'json';
              c &&
                (v = c.startsWith('text')
                  ? 'text'
                  : this.configuration.isJsonMime(c)
                  ? 'json'
                  : 'blob');
              let w = `/api/auth/users/${this.configuration.encodeParam({
                name: 'id',
                value: t,
                in: 'path',
                style: 'simple',
                explode: !1,
                dataType: 'string',
                dataFormat: void 0,
              })}`;
              return this.httpClient.request(
                'put',
                `${this.configuration.basePath}${w}`,
                {
                  context: d,
                  body: n,
                  responseType: v,
                  withCredentials: this.configuration.withCredentials,
                  headers: l,
                  observe: o,
                  transferCache: u,
                  reportProgress: i,
                }
              );
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(b.Qq), e.KVO(ue, 8), e.KVO(L, 8));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      const Ct = 'activeLang';
      let De = (() => {
          class r {
            authRestService;
            translocoService;
            langToLocaleMapping;
            activeLangService;
            constructor(t, n, o, i) {
              (this.authRestService = t),
                (this.translocoService = n),
                (this.langToLocaleMapping = o),
                (this.activeLangService = i);
            }
            getActiveLang() {
              return this.authRestService.authControllerProfile().pipe(
                (0, z.T)(
                  (t) => t.lang || this.translocoService.getDefaultLang()
                ),
                (0, O.W)((t) =>
                  'error' in t && 'AUTH-001' === t.error.code
                    ? (0, _.of)(
                        localStorage.getItem(Ct) ||
                          this.translocoService.getDefaultLang()
                      )
                    : (0, W.$)(() => t)
                )
              );
            }
            setActiveLang(t) {
              return this.authRestService
                .authControllerUpdateProfile({ lang: t })
                .pipe(
                  (0, k.M)(() => {
                    this.activeLangService.applyActiveLang(t);
                  }),
                  (0, O.W)((n) =>
                    'error' in n && 'AUTH-001' === n.error.code
                      ? (localStorage.setItem(Ct, t),
                        this.activeLangService.applyActiveLang(t),
                        (0, _.of)(null))
                      : (0, W.$)(() => n)
                  )
                );
            }
            static ɵfac = function (n) {
              return new (n || r)(
                e.KVO(we),
                e.KVO(g.JO),
                e.KVO(Q.RR),
                e.KVO(Pe)
              );
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        on = (() => {
          class r {
            appRestService;
            webhookRestService;
            timeRestService;
            authService;
            filesRestService;
            authRestService;
            translocoService;
            tokensService;
            authActiveLangService;
            activeLangService;
            subscribeToTokenUpdatesSubscription;
            constructor(t, n, o, i, a, l, c, d, u, p) {
              (this.appRestService = t),
                (this.webhookRestService = n),
                (this.timeRestService = o),
                (this.authService = i),
                (this.filesRestService = a),
                (this.authRestService = l),
                (this.translocoService = c),
                (this.tokensService = d),
                (this.authActiveLangService = u),
                (this.activeLangService = p);
            }
            resolve() {
              return (
                this.subscribeToTokenUpdates(),
                this.authService.refreshToken().pipe(
                  (0, M.Z)(() => this.authActiveLangService.getActiveLang()),
                  (0, M.Z)((t) =>
                    this.translocoService.load(t).pipe((0, z.T)(() => t))
                  ),
                  (0, k.M)((t) => this.activeLangService.applyActiveLang(t)),
                  (0, O.W)((t) => (console.error(t), (0, W.$)(() => t)))
                )
              );
            }
            subscribeToTokenUpdates() {
              this.subscribeToTokenUpdatesSubscription &&
                (this.subscribeToTokenUpdatesSubscription.unsubscribe(),
                (this.subscribeToTokenUpdatesSubscription = void 0)),
                (this.subscribeToTokenUpdatesSubscription = (0, be.h)(
                  this.tokensService.getStream(),
                  this.translocoService.langChanges$
                )
                  .pipe(
                    (0, k.M)(() => {
                      const t = this.authService.getAuthorizationHeaders();
                      t &&
                        ((this.appRestService.defaultHeaders = new b.Lr(t)),
                        (this.webhookRestService.defaultHeaders = new b.Lr(t)),
                        (this.filesRestService.defaultHeaders = new b.Lr(t)),
                        (this.timeRestService.defaultHeaders = new b.Lr(t)),
                        (this.authRestService.defaultHeaders = new b.Lr(t)));
                    })
                  )
                  .subscribe());
            }
            static ɵfac = function (n) {
              return new (n || r)(
                e.KVO(Se),
                e.KVO(se),
                e.KVO(Re),
                e.KVO(J),
                e.KVO(gt),
                e.KVO(we),
                e.KVO(g.JO),
                e.KVO(te),
                e.KVO(De),
                e.KVO(Pe)
              );
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      var sn = m(6504);
      let an = (() => {
        class r {
          nzNotificationService;
          translocoService;
          constructor(t, n) {
            (this.nzNotificationService = t), (this.translocoService = n);
          }
          handleError(t) {
            'error' in t && 'code' in t.error
              ? this.nzNotificationService.error(
                  t.error.code,
                  this.translocoService.translate(t.error.message)
                )
              : console.log(t);
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(sn.xY), e.KVO(g.JO));
          };
          static ɵprov = e.jDH({ token: r, factory: r.ɵfac });
        }
        return r;
      })();
      const ae = 'authGuardData';
      class pe {
        roles;
        constructor(s) {
          Object.assign(this, s);
        }
      }
      let Ce = (() => {
        class r {
          authAuthService;
          constructor(t) {
            this.authAuthService = t;
          }
          canActivate(t) {
            if (t.data[ae] instanceof pe) {
              const o = this.authAuthService.profile$.value,
                i = (t.data[ae].roles || []).map((a) => a.toLowerCase());
              return (0, _.of)(
                !!(
                  (o && i.length > 0 && i.some((a) => o.roles?.includes(a))) ||
                  (0 === i.length && !o?.roles)
                )
              );
            }
            return (0, _.of)(!0);
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(J));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      var $ = m(1958),
        j = m(7529),
        K = m(6351),
        he = m(9448),
        ne = m(1868),
        F = m(8408),
        D = m(8927),
        N = m(7094);
      const re = new Date().getTimezoneOffset() / 60;
      var oe = m(3183);
      let Ee = (() => {
          class r {
            toModel(t) {
              return {
                ...t,
                createdAt: t?.createdAt
                  ? (0, oe.L)(new Date(t.createdAt), re)
                  : null,
                updatedAt: t?.updatedAt
                  ? (0, oe.L)(new Date(t.updatedAt), re)
                  : null,
              };
            }
            toForm(t) {
              return { ...t };
            }
            toJson(t) {
              return { ...t };
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        ke = (() => {
          class r {
            appRestService;
            demoMapperService;
            constructor(t, n) {
              (this.appRestService = t), (this.demoMapperService = n);
            }
            findOne(t) {
              return this.appRestService
                .appControllerDemoFindOne(t)
                .pipe((0, z.T)(this.demoMapperService.toModel));
            }
            findMany() {
              return this.appRestService
                .appControllerDemoFindMany()
                .pipe((0, z.T)((t) => t.map(this.demoMapperService.toModel)));
            }
            updateOne(t) {
              return this.appRestService
                .appControllerDemoUpdateOne(t)
                .pipe((0, z.T)(this.demoMapperService.toModel));
            }
            deleteOne(t) {
              return this.appRestService.appControllerDemoDeleteOne(t);
            }
            createOne() {
              return this.appRestService
                .appControllerDemoCreateOne()
                .pipe((0, z.T)(this.demoMapperService.toModel));
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(Se), e.KVO(Ee));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      function ln(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'nz-form-control')(1, 'button', 3),
            e.EFF(2),
            e.nI1(3, 'transloco'),
            e.nI1(4, 'transloco'),
            e.k0s()()),
          2 & r)
        ) {
          const t = e.XpG(2);
          e.R7$(),
            e.Y8G('disabled', !t.form.valid),
            e.R7$(),
            e.SpI(' ', t.id ? e.bMT(3, 2, 'Save') : e.bMT(4, 4, 'Create'), ' ');
        }
      }
      function cn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'form', 1),
            e.bIt('ngSubmit', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.submitForm());
            }),
            e.nrm(1, 'formly-form', 2),
            e.nI1(2, 'async'),
            e.DNE(3, ln, 5, 6, 'nz-form-control'),
            e.k0s();
        }
        if (2 & r) {
          const t = e.XpG();
          e.Y8G('formGroup', t.form),
            e.R7$(),
            e.Y8G('model', e.bMT(2, 5, t.formlyModel$))('fields', s)(
              'form',
              t.form
            ),
            e.R7$(2),
            e.vxM(t.hideButtons ? -1 : 3);
        }
      }
      let Te = class qe {
        nzModalData;
        demoService;
        nzMessageService;
        translocoService;
        demoMapperService;
        id;
        hideButtons;
        inputs = { name: 'string' };
        afterFind = new e.bkB();
        afterCreate = new e.bkB();
        afterUpdate = new e.bkB();
        form = new y.J3({});
        formlyModel$ = new T.t(null);
        formlyFields$ = new T.t(null);
        constructor(s, t, n, o, i) {
          (this.nzModalData = s),
            (this.demoService = t),
            (this.nzMessageService = n),
            (this.translocoService = o),
            (this.demoMapperService = i);
        }
        ngOnInit() {
          Object.assign(this, this.nzModalData),
            this.id
              ? this.findOne()
                  .pipe(
                    (0, k.M)((s) => this.afterFind.next(s)),
                    (0, S.s)(this)
                  )
                  .subscribe()
              : this.setFieldsAndModel();
        }
        setFieldsAndModel(s = {}) {
          this.formlyFields$.next([
            {
              key: 'name',
              type: 'input',
              validation: { show: !0 },
              props: {
                label: this.translocoService.translate('demo.form.fields.name'),
                placeholder: 'name',
                readonly: !0,
                description: this.translocoService.translate(
                  'read-only field, set and updated on the backend'
                ),
                required: !1,
              },
            },
          ]),
            this.formlyModel$.next(s || null);
        }
        submitForm() {
          this.form.valid
            ? this.id
              ? this.updateOne()
                  .pipe(
                    (0, k.M)((s) => {
                      this.nzMessageService.success(
                        this.translocoService.translate('Success')
                      ),
                        this.afterUpdate.next(s);
                    }),
                    (0, S.s)(this)
                  )
                  .subscribe()
              : this.createOne()
                  .pipe(
                    (0, k.M)((s) => {
                      this.nzMessageService.success(
                        this.translocoService.translate('Success')
                      ),
                        this.afterCreate.next(s);
                    }),
                    (0, S.s)(this)
                  )
                  .subscribe()
            : (console.log(this.form.controls),
              this.nzMessageService.warning(
                this.translocoService.translate('Validation errors')
              ));
        }
        createOne() {
          return this.demoService.createOne();
        }
        updateOne() {
          if (!this.id)
            throw new Error(this.translocoService.translate('id not set'));
          return this.demoService.updateOne(this.id);
        }
        findOne() {
          if (!this.id)
            throw new Error(this.translocoService.translate('id not set'));
          return this.demoService.findOne(this.id).pipe(
            (0, k.M)((s) => {
              this.setFieldsAndModel(this.demoMapperService.toForm(s));
            })
          );
        }
        static ɵfac = function (t) {
          return new (t || qe)(
            e.rXU(G.or, 8),
            e.rXU(ke),
            e.rXU(N.xh),
            e.rXU(g.JO),
            e.rXU(Ee)
          );
        };
        static ɵcmp = e.VBU({
          type: qe,
          selectors: [['app-demo-form']],
          inputs: { id: 'id', hideButtons: 'hideButtons', inputs: 'inputs' },
          outputs: {
            afterFind: 'afterFind',
            afterCreate: 'afterCreate',
            afterUpdate: 'afterUpdate',
          },
          decls: 2,
          vars: 3,
          consts: [
            ['nz-form', '', 3, 'formGroup'],
            ['nz-form', '', 3, 'ngSubmit', 'formGroup'],
            [3, 'model', 'fields', 'form'],
            [
              'nzBlock',
              '',
              'nz-button',
              '',
              'nzType',
              'primary',
              'type',
              'submit',
              3,
              'disabled',
            ],
          ],
          template: function (t, n) {
            if (
              (1 & t && (e.DNE(0, cn, 4, 7, 'form', 0), e.nI1(1, 'async')),
              2 & t)
            ) {
              let o;
              e.vxM((o = e.bMT(1, 1, n.formlyFields$)) ? 0 : -1, o);
            }
          },
          dependencies: [
            R.qy,
            R.aF,
            D.PQ,
            j.Uq,
            D.CA,
            D.zS,
            E.j,
            U.Zw,
            U.aO,
            q.c,
            Z.p,
            y.YN,
            y.qT,
            y.cb,
            y.X1,
            y.j4,
            V.Jj,
            g.Kj,
          ],
          encapsulation: 2,
          changeDetection: 0,
        });
      };
      Te = (0, C.Cg)(
        [(0, S.d)(), (0, C.Sn)('design:paramtypes', [Te, ke, N.xh, g.JO, Ee])],
        Te
      );
      const dn = () => [],
        un = () => ['createdAt', 'updatedAt'],
        pn = () => ({ dateStyle: 'medium', timeStyle: 'medium' });
      function hn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'th', 8), e.EFF(1), e.nI1(2, 'transloco'), e.k0s()),
          2 & r)
        ) {
          const t = s.$implicit,
            n = e.XpG();
          e.Y8G('nzColumnKey', t), e.R7$(), e.JRh(e.bMT(2, 2, n.columns[t]));
        }
      }
      function fn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'td'), e.EFF(1), e.nI1(2, 'translocoDate'), e.k0s()),
          2 & r)
        ) {
          const t = e.XpG().$implicit,
            n = e.XpG().$implicit;
          e.R7$(), e.SpI(' ', e.i5U(2, 1, +n[t], e.lJ4(4, pn)), ' ');
        }
      }
      function mn(r, s) {
        if ((1 & r && (e.j41(0, 'td'), e.EFF(1), e.k0s()), 2 & r)) {
          const t = e.XpG().$implicit,
            n = e.XpG().$implicit;
          e.R7$(), e.SpI(' ', n[t], ' ');
        }
      }
      function gn(r, s) {
        if ((1 & r && e.DNE(0, fn, 3, 5, 'td')(1, mn, 2, 1, 'td'), 2 & r)) {
          const t = s.$implicit,
            n = e.XpG().$implicit;
          e.vxM(n[t] && e.lJ4(1, un).includes(t) ? 0 : 1);
        }
      }
      function vn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'tr', 11),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(),
                a = e.XpG();
              return e.Njj(
                a.selectedIds$.next(
                  i[0] === (o.id || 'empty') ? [] : [o.id || 'empty']
                )
              );
            }),
            e.Z7z(1, gn, 2, 2, null, null, e.Vm6),
            e.j41(3, 'td')(4, 'a', 12),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(2);
              return e.Njj(i.showCreateOrUpdateModal(o.id));
            }),
            e.k0s(),
            e.nrm(5, 'nz-divider', 13),
            e.j41(6, 'a', 14),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(2);
              return e.Njj(null != o && o.id ? i.showDeleteModal(o.id) : null);
            }),
            e.k0s()()();
        }
        if (2 & r) {
          const t = s.$implicit,
            n = e.XpG(),
            o = e.XpG();
          e.AVh('selected', n[0] === t.id), e.R7$(), e.Dyx(o.keys);
        }
      }
      function bn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'tbody'), e.Z7z(1, vn, 7, 2, 'tr', 10, e.Vm6), e.k0s()),
          2 & r)
        ) {
          e.XpG();
          const t = e.sdS(7);
          e.R7$(), e.Dyx(t.data);
        }
      }
      let Ge = class Ze {
        demoService;
        nzModalService;
        viewContainerRef;
        translocoService;
        items$ = new T.t([]);
        selectedIds$ = new T.t([]);
        keys = ['id', 'name', 'createdAt', 'updatedAt'];
        columns = {
          id: (0, f.x)('app-demo.grid.columns.id'),
          name: (0, f.x)('app-demo.grid.columns.name'),
          createdAt: (0, f.x)('app-demo.grid.columns.created-at'),
          updatedAt: (0, f.x)('app-demo.grid.columns.updated-at'),
        };
        constructor(s, t, n, o) {
          (this.demoService = s),
            (this.nzModalService = t),
            (this.viewContainerRef = n),
            (this.translocoService = o);
        }
        ngOnInit() {
          this.loadMany();
        }
        loadMany() {
          this.demoService
            .findMany()
            .pipe(
              (0, k.M)((s) => {
                this.items$.next(s), this.selectedIds$.next([]);
              }),
              (0, S.s)(this)
            )
            .subscribe();
        }
        showCreateOrUpdateModal(s) {
          const t = this.nzModalService.create({
            nzTitle: s
              ? this.translocoService.translate('Update demo', { id: s })
              : this.translocoService.translate('Create demo'),
            nzContent: Te,
            nzViewContainerRef: this.viewContainerRef,
            nzData: { hideButtons: !0, id: s },
            nzFooter: [
              {
                label: this.translocoService.translate('Cancel'),
                onClick: () => {
                  t.close();
                },
              },
              {
                label: this.translocoService.translate(s ? 'Save' : 'Create'),
                onClick: () => {
                  t.componentInstance?.afterUpdate
                    .pipe(
                      (0, k.M)(() => {
                        t.close(), this.loadMany();
                      }),
                      (0, S.s)(t.componentInstance)
                    )
                    .subscribe(),
                    t.componentInstance?.afterCreate
                      .pipe(
                        (0, k.M)(() => {
                          t.close(), this.loadMany();
                        }),
                        (0, S.s)(t.componentInstance)
                      )
                      .subscribe(),
                    t.componentInstance?.submitForm();
                },
                type: 'primary',
              },
            ],
          });
        }
        showDeleteModal(s) {
          this.nzModalService.confirm({
            nzTitle: this.translocoService.translate('Delete demo #{{id}}', {
              id: s,
            }),
            nzOkText: this.translocoService.translate('Yes'),
            nzCancelText: this.translocoService.translate('No'),
            nzOnOk: () => {
              this.demoService
                .deleteOne(s)
                .pipe(
                  (0, k.M)(() => {
                    this.loadMany();
                  }),
                  (0, S.s)(this)
                )
                .subscribe();
            },
          });
        }
        static ɵfac = function (t) {
          return new (t || Ze)(
            e.rXU(ke),
            e.rXU(G.N_),
            e.rXU(e.c1b),
            e.rXU(g.JO)
          );
        };
        static ɵcmp = e.VBU({
          type: Ze,
          selectors: [['app-demo-grid']],
          decls: 16,
          vars: 10,
          consts: [
            ['basicTable', ''],
            ['nz-row', '', 'nzJustify', 'space-between', 1, 'table-operations'],
            ['nz-col', '', 'nzSpan', '4'],
            [
              'nz-button',
              '',
              'nzType',
              'primary',
              'transloco',
              'Create new',
              3,
              'click',
            ],
            ['nz-col', ''],
            ['nz-button', '', 'nzType', 'primary', 'nzSearch', '', 3, 'click'],
            ['nz-icon', '', 'nzType', 'search'],
            [
              'nzShowPagination',
              '',
              'nzShowSizeChanger',
              '',
              3,
              'nzQueryParams',
              'nzBordered',
              'nzOuterBordered',
              'nzFrontPagination',
              'nzData',
            ],
            [3, 'nzColumnKey'],
            ['transloco', 'Action'],
            [3, 'selected'],
            [3, 'click'],
            ['transloco', 'Edit', 3, 'click'],
            ['nzType', 'vertical'],
            ['transloco', 'Delete', 3, 'click'],
          ],
          template: function (t, n) {
            if (1 & t) {
              const o = e.RV6();
              e.j41(0, 'div', 1)(1, 'div', 2)(2, 'button', 3),
                e.bIt('click', function () {
                  return e.eBV(o), e.Njj(n.showCreateOrUpdateModal());
                }),
                e.k0s()(),
                e.j41(3, 'div', 4)(4, 'button', 5),
                e.bIt('click', function () {
                  return e.eBV(o), e.Njj(n.loadMany());
                }),
                e.nrm(5, 'span', 6),
                e.k0s()()(),
                e.j41(6, 'nz-table', 7, 0),
                e.nI1(8, 'async'),
                e.bIt('nzQueryParams', function () {
                  return e.eBV(o), e.Njj(n.loadMany());
                }),
                e.j41(9, 'thead')(10, 'tr'),
                e.Z7z(11, hn, 3, 4, 'th', 8, e.Vm6),
                e.nrm(13, 'th', 9),
                e.k0s()(),
                e.DNE(14, bn, 3, 0, 'tbody'),
                e.nI1(15, 'async'),
                e.k0s();
            }
            if (2 & t) {
              let o;
              e.R7$(6),
                e.Y8G('nzBordered', !0)('nzOuterBordered', !0)(
                  'nzFrontPagination',
                  !1
                )('nzData', e.bMT(8, 5, n.items$) || e.lJ4(9, dn)),
                e.R7$(5),
                e.Dyx(n.keys),
                e.R7$(3),
                e.vxM((o = e.bMT(15, 7, n.selectedIds$)) ? 14 : -1, o);
            }
          },
          dependencies: [
            j.f3,
            j.Uq,
            j.e,
            ne.GP,
            K.z6,
            F.$G,
            F.CP,
            F.Cc,
            F.SO,
            F._4,
            F.IL,
            F.aj,
            F.kt,
            he.g,
            he.j,
            V.MD,
            V.Jj,
            P.iI,
            G.U6,
            U.Zw,
            U.aO,
            q.c,
            Z.p,
            E.j,
            ee.Y3,
            ee.Dn,
            y.YN,
            y.X1,
            g.bA,
            g.Kj,
            Q.IA,
          ],
          encapsulation: 2,
          changeDetection: 0,
        });
      };
      Ge = (0, C.Cg)(
        [(0, S.d)(), (0, C.Sn)('design:paramtypes', [ke, G.N_, e.c1b, g.JO])],
        Ge
      );
      let yn = (() => {
        class r {
          static ɵfac = function (n) {
            return new (n || r)();
          };
          static ɵcmp = e.VBU({
            type: r,
            selectors: [['app-demo']],
            decls: 5,
            vars: 1,
            consts: [
              ['demoGrid', ''],
              ['transloco', 'Demo'],
              [1, 'inner-content'],
              ['nz-col', '', 3, 'nzSpan'],
            ],
            template: function (n, o) {
              1 & n &&
                (e.j41(0, 'nz-breadcrumb'),
                e.nrm(1, 'nz-breadcrumb-item', 1),
                e.k0s(),
                e.j41(2, 'nz-row', 2),
                e.nrm(3, 'app-demo-grid', 3, 0),
                e.k0s()),
                2 & n && (e.R7$(3), e.Y8G('nzSpan', 24));
            },
            dependencies: [$.EJ, $.hL, $.K7, Ge, j.f3, j.Uq, j.e, K.z6, g.bA],
            encapsulation: 2,
            changeDetection: 0,
          });
        }
        return r;
      })();
      var Le = m(4696),
        We = m(8852);
      let Sn = (() => {
          class r {
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵcmp = e.VBU({
              type: r,
              selectors: [['app-home']],
              decls: 84,
              vars: 51,
              consts: [
                ['transloco', 'Home'],
                [1, 'inner-content'],
                ['transloco', 'Hello Static'],
                ['nzActive', 'true', 3, 'nzHeader'],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'git clone git@github.com:nestjs-mod/nestjs-mod-fullstack.git\ncd nestjs-mod-fullstack\nnpm i',
                ],
                [
                  'rows',
                  '3',
                  'readonly',
                  'true',
                  1,
                  'border-1',
                  'p-2',
                  'bg-slate-100',
                  'w-full',
                  'h-auto',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:dev:start',
                ],
                [
                  'rows',
                  '1',
                  'readonly',
                  'true',
                  1,
                  'border-1',
                  'p-2',
                  'bg-slate-100',
                  'w-full',
                  'h-auto',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'http://localhost:4200',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:dev:test:e2e',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:dev:stop',
                ],
                [3, 'nzHeader'],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:prod:start',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'http://localhost:3000',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:prod:test:e2e',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'npm run pm2-full:prod:stop',
                ],
                [
                  'nz-typography',
                  '',
                  'nzCopyable',
                  '',
                  'nzCopyText',
                  'http://localhost:8080',
                ],
              ],
              template: function (n, o) {
                1 & n &&
                  (e.j41(0, 'nz-breadcrumb'),
                  e.nrm(1, 'nz-breadcrumb-item', 0),
                  e.k0s(),
                  e.j41(2, 'div', 1),
                  e.nrm(3, 'span', 2),
                  e.j41(4, 'nz-collapse')(5, 'nz-collapse-panel', 3),
                  e.nI1(6, 'transloco'),
                  e.j41(7, 'h6', 4),
                  e.EFF(8),
                  e.nI1(9, 'transloco'),
                  e.k0s(),
                  e.j41(10, 'textarea', 5),
                  e.EFF(11, 'git clone git@'),
                  e.EFF(
                    12,
                    'github.com:nestjs-mod/nestjs-mod-fullstack.git\ncd nestjs-mod-fullstack\nnpm i'
                  ),
                  e.k0s(),
                  e.j41(13, 'h6', 6),
                  e.EFF(14),
                  e.nI1(15, 'transloco'),
                  e.k0s(),
                  e.j41(16, 'textarea', 7),
                  e.EFF(17, 'npm run pm2-full:dev:start'),
                  e.k0s(),
                  e.j41(18, 'h6', 8),
                  e.EFF(19),
                  e.nI1(20, 'transloco'),
                  e.k0s(),
                  e.j41(21, 'textarea', 7),
                  e.EFF(22, 'http://localhost:4200'),
                  e.k0s(),
                  e.j41(23, 'h6', 9),
                  e.EFF(24),
                  e.nI1(25, 'transloco'),
                  e.k0s(),
                  e.j41(26, 'textarea', 7),
                  e.EFF(27, 'npm run pm2-full:dev:test:e2e'),
                  e.k0s(),
                  e.j41(28, 'h6', 10),
                  e.EFF(29),
                  e.nI1(30, 'transloco'),
                  e.k0s(),
                  e.j41(31, 'textarea', 7),
                  e.EFF(32, 'npm run pm2-full:dev:stop'),
                  e.k0s()(),
                  e.j41(33, 'nz-collapse-panel', 11),
                  e.nI1(34, 'transloco'),
                  e.j41(35, 'h6', 4),
                  e.EFF(36),
                  e.nI1(37, 'transloco'),
                  e.k0s(),
                  e.j41(38, 'textarea', 5),
                  e.EFF(39, 'git clone git@'),
                  e.EFF(
                    40,
                    'github.com:nestjs-mod/nestjs-mod-fullstack.git\ncd nestjs-mod-fullstack\nnpm i'
                  ),
                  e.k0s(),
                  e.j41(41, 'h6', 12),
                  e.EFF(42),
                  e.nI1(43, 'transloco'),
                  e.k0s(),
                  e.j41(44, 'textarea', 7),
                  e.EFF(45, 'npm run pm2-full:prod:start'),
                  e.k0s(),
                  e.j41(46, 'h6', 13),
                  e.EFF(47),
                  e.nI1(48, 'transloco'),
                  e.k0s(),
                  e.j41(49, 'textarea', 7),
                  e.EFF(50, 'http://localhost:3000'),
                  e.k0s(),
                  e.j41(51, 'h6', 14),
                  e.EFF(52),
                  e.nI1(53, 'transloco'),
                  e.k0s(),
                  e.j41(54, 'textarea', 7),
                  e.EFF(55, 'npm run pm2-full:prod:test:e2e'),
                  e.k0s(),
                  e.j41(56, 'h6', 15),
                  e.EFF(57),
                  e.nI1(58, 'transloco'),
                  e.k0s(),
                  e.j41(59, 'textarea', 7),
                  e.EFF(60, 'npm run pm2-full:prod:stop'),
                  e.k0s()(),
                  e.j41(61, 'nz-collapse-panel', 11),
                  e.nI1(62, 'transloco'),
                  e.j41(63, 'h6', 4),
                  e.EFF(64),
                  e.nI1(65, 'transloco'),
                  e.k0s(),
                  e.j41(66, 'textarea', 5),
                  e.EFF(67, 'git clone git@'),
                  e.EFF(
                    68,
                    'github.com:nestjs-mod/nestjs-mod-fullstack.git\ncd nestjs-mod-fullstack\nnpm i'
                  ),
                  e.k0s(),
                  e.j41(69, 'h6', 12),
                  e.EFF(70),
                  e.nI1(71, 'transloco'),
                  e.k0s(),
                  e.j41(72, 'textarea', 7),
                  e.EFF(73, 'npm run docker-compose-full:prod:start'),
                  e.k0s(),
                  e.j41(74, 'h6', 16),
                  e.EFF(75),
                  e.nI1(76, 'transloco'),
                  e.k0s(),
                  e.j41(77, 'textarea', 7),
                  e.EFF(78, 'http://localhost:8080'),
                  e.k0s(),
                  e.j41(79, 'h6', 15),
                  e.EFF(80),
                  e.nI1(81, 'transloco'),
                  e.k0s(),
                  e.j41(82, 'textarea', 7),
                  e.EFF(83, 'npm run docker-compose-full:prod:stop'),
                  e.k0s()()()()),
                  2 & n &&
                    (e.R7$(5),
                    e.Y8G(
                      'nzHeader',
                      e.bMT(
                        6,
                        17,
                        'Dev/Watch mode: the infrastructure is running using docker-compose, applications are launched in watch pm2 mode'
                      )
                    ),
                    e.R7$(3),
                    e.SpI(' ', e.bMT(9, 19, 'Init'), ' '),
                    e.R7$(6),
                    e.SpI(' ', e.bMT(15, 21, 'Start'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(20, 23, 'Open in browser'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(25, 25, 'Testing'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(30, 27, 'Stop'), ' '),
                    e.R7$(4),
                    e.Y8G(
                      'nzHeader',
                      e.bMT(
                        34,
                        29,
                        'Prod mode: the infrastructure is running using docker-compose, built applications are launched using pm2'
                      )
                    ),
                    e.R7$(3),
                    e.SpI(' ', e.bMT(37, 31, 'Init'), ' '),
                    e.R7$(6),
                    e.SpI(' ', e.bMT(43, 33, 'Start'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(48, 35, 'Open in browser'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(53, 37, 'Testing'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(58, 39, 'Stop'), ' '),
                    e.R7$(4),
                    e.Y8G(
                      'nzHeader',
                      e.bMT(
                        62,
                        41,
                        'Docker-compose prod mode: the infrastructure and applications built into Docker images are run using docker-compose'
                      )
                    ),
                    e.R7$(3),
                    e.SpI(' ', e.bMT(65, 43, 'Init'), ' '),
                    e.R7$(6),
                    e.SpI(' ', e.bMT(71, 45, 'Start'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(76, 47, 'Open in browser'), ' '),
                    e.R7$(5),
                    e.SpI(' ', e.bMT(81, 49, 'Stop'), ' '));
              },
              dependencies: [
                $.EJ,
                $.hL,
                $.K7,
                We.kT,
                We.Di,
                g.bA,
                Le.GB,
                Le.Vz,
                Le.pc,
                g.Kj,
              ],
              encapsulation: 2,
              changeDetection: 0,
            });
          }
          return r;
        })(),
        kt = (() => {
          let r = class He {
            translocoService;
            validationService;
            constructor(t, n) {
              (this.translocoService = t), (this.validationService = n);
            }
            init() {
              return (0, _.of)(!0);
            }
            getFormlyFields(t) {
              return this.validationService.appendServerErrorsAsValidatorsToFields(
                [
                  {
                    key: 'email',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.sign-in-form.fields.email'
                      ),
                      placeholder: 'email',
                      required: !0,
                    },
                  },
                  {
                    key: 'password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.sign-in-form.fields.password'
                      ),
                      placeholder: 'password',
                      required: !0,
                      type: 'password',
                    },
                  },
                ],
                t?.errors || []
              );
            }
            static ɵfac = function (n) {
              return new (n || He)(e.KVO(g.JO), e.KVO(I));
            };
            static ɵprov = e.jDH({
              token: He,
              factory: He.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [g.JO, I])],
              r
            )),
            r
          );
        })(),
        Tt = (() => {
          class r {
            toModel(t) {
              return { email: t.email, password: t.password };
            }
            toJson(t) {
              return { email: t.email, password: t.password };
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      function wn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'nz-form-control')(1, 'div', 3)(2, 'div'),
            e.nrm(3, 'button', 4),
            e.k0s(),
            e.nrm(4, 'button', 5),
            e.k0s()()),
          2 & r)
        ) {
          const t = e.XpG(2);
          e.R7$(3),
            e.Y8G('routerLink', '/sign-up'),
            e.R7$(),
            e.Y8G('disabled', !t.form.valid);
        }
      }
      function Cn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'form', 1),
            e.bIt('ngSubmit', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.submitForm());
            }),
            e.nrm(1, 'formly-form', 2),
            e.nI1(2, 'async'),
            e.DNE(3, wn, 5, 2, 'nz-form-control'),
            e.k0s();
        }
        if (2 & r) {
          const t = e.XpG();
          e.Y8G('formGroup', t.form),
            e.R7$(),
            e.Y8G('model', e.bMT(2, 5, t.formlyModel$))('fields', s)(
              'form',
              t.form
            ),
            e.R7$(2),
            e.vxM(t.hideButtons ? -1 : 3);
        }
      }
      let kn = (() => {
          let r = class Qe {
            nzModalData;
            authService;
            nzMessageService;
            translocoService;
            authSignInFormService;
            authSignInMapperService;
            validationService;
            hideButtons;
            afterSignIn = new e.bkB();
            form = new y.J3({});
            formlyModel$ = new T.t(null);
            formlyFields$ = new T.t(null);
            constructor(t, n, o, i, a, l, c) {
              (this.nzModalData = t),
                (this.authService = n),
                (this.nzMessageService = o),
                (this.translocoService = i),
                (this.authSignInFormService = a),
                (this.authSignInMapperService = l),
                (this.validationService = c);
            }
            ngOnInit() {
              Object.assign(this, this.nzModalData),
                this.setFieldsAndModel({ password: '' });
            }
            setFieldsAndModel(t = { password: '' }) {
              const n = this.authSignInMapperService.toModel(t);
              this.setFormlyFields({ data: n }), this.formlyModel$.next(n);
            }
            submitForm() {
              if (this.form.valid) {
                const t = this.authSignInMapperService.toJson(this.form.value);
                this.authService
                  .signIn(t)
                  .pipe(
                    (0, k.M)((n) => {
                      n.tokens &&
                        (this.afterSignIn.next(n.tokens),
                        this.nzMessageService.success(
                          this.translocoService.translate('Success')
                        ));
                    }),
                    (0, O.W)((n) =>
                      this.validationService.catchAndProcessServerError(
                        n,
                        (o) => this.setFormlyFields(o)
                      )
                    ),
                    (0, O.W)(
                      (n) => (
                        console.error(n),
                        this.nzMessageService.error(n.message),
                        (0, _.of)(null)
                      )
                    ),
                    (0, S.s)(this)
                  )
                  .subscribe();
              } else
                console.log(this.form.controls),
                  this.nzMessageService.warning(
                    this.translocoService.translate('Validation errors')
                  );
            }
            setFormlyFields(t) {
              this.formlyFields$.next(
                this.authSignInFormService.getFormlyFields(t)
              );
            }
            static ɵfac = function (n) {
              return new (n || Qe)(
                e.rXU(G.or, 8),
                e.rXU(J),
                e.rXU(N.xh),
                e.rXU(g.JO),
                e.rXU(kt),
                e.rXU(Tt),
                e.rXU(I)
              );
            };
            static ɵcmp = e.VBU({
              type: Qe,
              selectors: [['auth-sign-in-form']],
              inputs: { hideButtons: 'hideButtons' },
              outputs: { afterSignIn: 'afterSignIn' },
              decls: 2,
              vars: 3,
              consts: [
                ['nz-form', '', 3, 'formGroup'],
                ['nz-form', '', 3, 'ngSubmit', 'formGroup'],
                [3, 'model', 'fields', 'form'],
                [1, 'flex', 'justify-between'],
                [
                  'nz-button',
                  '',
                  'nzType',
                  'default',
                  'type',
                  'button',
                  'transloco',
                  'Sign-up',
                  3,
                  'routerLink',
                ],
                [
                  'nz-button',
                  '',
                  'nzType',
                  'primary',
                  'type',
                  'submit',
                  'transloco',
                  'Sign-in',
                  3,
                  'disabled',
                ],
              ],
              template: function (n, o) {
                if (
                  (1 & n && (e.DNE(0, Cn, 4, 7, 'form', 0), e.nI1(1, 'async')),
                  2 & n)
                ) {
                  let i;
                  e.vxM((i = e.bMT(1, 1, o.formlyFields$)) ? 0 : -1, i);
                }
              },
              dependencies: [
                R.qy,
                R.aF,
                D.PQ,
                j.Uq,
                D.CA,
                D.zS,
                E.j,
                U.Zw,
                U.aO,
                q.c,
                Z.p,
                y.YN,
                y.qT,
                y.cb,
                y.X1,
                y.j4,
                V.Jj,
                P.iI,
                P.Wk,
                g.bA,
              ],
              encapsulation: 2,
              changeDetection: 0,
            });
          };
          return (
            (r = (0, C.Cg)(
              [
                (0, S.d)(),
                (0, C.Sn)('design:paramtypes', [r, J, N.xh, g.JO, kt, Tt, I]),
              ],
              r
            )),
            r
          );
        })(),
        Tn = (() => {
          class r {
            router;
            constructor(t) {
              this.router = t;
            }
            onAfterSignIn() {
              this.router.navigate(['/webhooks']);
            }
            static ɵfac = function (n) {
              return new (n || r)(e.rXU(P.Ix));
            };
            static ɵcmp = e.VBU({
              type: r,
              selectors: [['app-sign-in']],
              decls: 4,
              vars: 0,
              consts: [
                ['transloco', 'Sign-in'],
                [1, 'inner-content'],
                [3, 'afterSignIn'],
              ],
              template: function (n, o) {
                1 & n &&
                  (e.j41(0, 'nz-breadcrumb'),
                  e.nrm(1, 'nz-breadcrumb-item', 0),
                  e.k0s(),
                  e.j41(2, 'div', 1)(3, 'auth-sign-in-form', 2),
                  e.bIt('afterSignIn', function () {
                    return o.onAfterSignIn();
                  }),
                  e.k0s()());
              },
              dependencies: [$.EJ, $.hL, $.K7, g.bA, kn],
              encapsulation: 2,
              changeDetection: 0,
            });
          }
          return r;
        })(),
        _t = (() => {
          let r = class xe {
            translocoService;
            validationService;
            constructor(t, n) {
              (this.translocoService = t), (this.validationService = n);
            }
            init() {
              return (0, _.of)(!0);
            }
            getFormlyFields(t) {
              return this.validationService.appendServerErrorsAsValidatorsToFields(
                [
                  {
                    key: 'email',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.sign-up-form.fields.email'
                      ),
                      placeholder: 'email',
                      required: !0,
                    },
                  },
                  {
                    key: 'password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.sign-up-form.fields.password'
                      ),
                      placeholder: 'password',
                      required: !0,
                      type: 'password',
                    },
                  },
                  {
                    key: 'confirm_password',
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'auth.sign-up-form.fields.confirm-password'
                      ),
                      placeholder: 'confirm_password',
                      required: !0,
                      type: 'password',
                    },
                  },
                ],
                t?.errors || []
              );
            }
            static ɵfac = function (n) {
              return new (n || xe)(e.KVO(g.JO), e.KVO(I));
            };
            static ɵprov = e.jDH({
              token: xe,
              factory: xe.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [g.JO, I])],
              r
            )),
            r
          );
        })(),
        zt = (() => {
          class r {
            toModel(t) {
              return {
                email: t.email,
                password: t.password,
                confirm_password: t.confirm_password,
              };
            }
            toJson(t) {
              return {
                email: t.email,
                password: t.password,
                confirm_password: t.confirm_password,
              };
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      function _n(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'nz-form-control')(1, 'div', 3)(2, 'div'),
            e.nrm(3, 'button', 4),
            e.k0s(),
            e.nrm(4, 'button', 5),
            e.k0s()()),
          2 & r)
        ) {
          const t = e.XpG(2);
          e.R7$(3),
            e.Y8G('routerLink', '/sign-in'),
            e.R7$(),
            e.Y8G('disabled', !t.form.valid);
        }
      }
      function zn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'form', 1),
            e.bIt('ngSubmit', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.submitForm());
            }),
            e.nrm(1, 'formly-form', 2),
            e.nI1(2, 'async'),
            e.DNE(3, _n, 5, 2, 'nz-form-control'),
            e.k0s();
        }
        if (2 & r) {
          const t = e.XpG();
          e.Y8G('formGroup', t.form),
            e.R7$(),
            e.Y8G('model', e.bMT(2, 5, t.formlyModel$))('fields', s)(
              'form',
              t.form
            ),
            e.R7$(2),
            e.vxM(t.hideButtons ? -1 : 3);
        }
      }
      let An = (() => {
          let r = class et {
            nzModalData;
            authService;
            nzMessageService;
            translocoService;
            authSignUpFormService;
            authSignUpMapperService;
            validationService;
            hideButtons;
            afterSignUp = new e.bkB();
            form = new y.J3({});
            formlyModel$ = new T.t(null);
            formlyFields$ = new T.t(null);
            constructor(t, n, o, i, a, l, c) {
              (this.nzModalData = t),
                (this.authService = n),
                (this.nzMessageService = o),
                (this.translocoService = i),
                (this.authSignUpFormService = a),
                (this.authSignUpMapperService = l),
                (this.validationService = c);
            }
            ngOnInit() {
              Object.assign(this, this.nzModalData),
                this.setFieldsAndModel({ password: '', confirm_password: '' });
            }
            setFieldsAndModel(t = { password: '', confirm_password: '' }) {
              const n = this.authSignUpMapperService.toModel(t);
              this.setFormlyFields({ data: n }), this.formlyModel$.next(n);
            }
            submitForm() {
              if (this.form.valid) {
                const t = this.authSignUpMapperService.toJson(this.form.value);
                this.authService
                  .signUp({ ...t })
                  .pipe(
                    (0, k.M)((n) => {
                      n.tokens &&
                        (this.afterSignUp.next(n.tokens),
                        this.nzMessageService.success(
                          this.translocoService.translate('Success')
                        ));
                    }),
                    (0, O.W)((n) =>
                      this.validationService.catchAndProcessServerError(
                        n,
                        (o) => this.setFormlyFields(o)
                      )
                    ),
                    (0, O.W)(
                      (n) => (
                        console.error(n),
                        this.nzMessageService.error(n.message),
                        (0, _.of)(null)
                      )
                    ),
                    (0, S.s)(this)
                  )
                  .subscribe();
              } else
                console.log(this.form.controls),
                  this.nzMessageService.warning(
                    this.translocoService.translate('Validation errors')
                  );
            }
            setFormlyFields(t) {
              this.formlyFields$.next(
                this.authSignUpFormService.getFormlyFields(t)
              );
            }
            static ɵfac = function (n) {
              return new (n || et)(
                e.rXU(G.or, 8),
                e.rXU(J),
                e.rXU(N.xh),
                e.rXU(g.JO),
                e.rXU(_t),
                e.rXU(zt),
                e.rXU(I)
              );
            };
            static ɵcmp = e.VBU({
              type: et,
              selectors: [['auth-sign-up-form']],
              inputs: { hideButtons: 'hideButtons' },
              outputs: { afterSignUp: 'afterSignUp' },
              decls: 2,
              vars: 3,
              consts: [
                ['nz-form', '', 3, 'formGroup'],
                ['nz-form', '', 3, 'ngSubmit', 'formGroup'],
                [3, 'model', 'fields', 'form'],
                [1, 'flex', 'justify-between'],
                [
                  'nz-button',
                  '',
                  'nzType',
                  'default',
                  'type',
                  'button',
                  'transloco',
                  'Sign-in',
                  3,
                  'routerLink',
                ],
                [
                  'nz-button',
                  '',
                  'nzType',
                  'primary',
                  'type',
                  'submit',
                  'transloco',
                  'Sign-up',
                  3,
                  'disabled',
                ],
              ],
              template: function (n, o) {
                if (
                  (1 & n && (e.DNE(0, zn, 4, 7, 'form', 0), e.nI1(1, 'async')),
                  2 & n)
                ) {
                  let i;
                  e.vxM((i = e.bMT(1, 1, o.formlyFields$)) ? 0 : -1, i);
                }
              },
              dependencies: [
                R.qy,
                R.aF,
                D.PQ,
                j.Uq,
                D.CA,
                D.zS,
                E.j,
                U.Zw,
                U.aO,
                q.c,
                Z.p,
                y.YN,
                y.qT,
                y.cb,
                y.X1,
                y.j4,
                V.Jj,
                P.iI,
                P.Wk,
                g.bA,
              ],
              encapsulation: 2,
              changeDetection: 0,
            });
          };
          return (
            (r = (0, C.Cg)(
              [
                (0, S.d)(),
                (0, C.Sn)('design:paramtypes', [r, J, N.xh, g.JO, _t, zt, I]),
              ],
              r
            )),
            r
          );
        })(),
        Fn = (() => {
          class r {
            router;
            constructor(t) {
              this.router = t;
            }
            onAfterSignUp() {
              this.router.navigate(['/webhooks']);
            }
            static ɵfac = function (n) {
              return new (n || r)(e.rXU(P.Ix));
            };
            static ɵcmp = e.VBU({
              type: r,
              selectors: [['app-sign-up']],
              decls: 4,
              vars: 0,
              consts: [
                ['transloco', 'Sign-up'],
                [1, 'inner-content'],
                [3, 'afterSignUp'],
              ],
              template: function (n, o) {
                1 & n &&
                  (e.j41(0, 'nz-breadcrumb'),
                  e.nrm(1, 'nz-breadcrumb-item', 0),
                  e.k0s(),
                  e.j41(2, 'div', 1)(3, 'auth-sign-up-form', 2),
                  e.bIt('afterSignUp', function () {
                    return o.onAfterSignUp();
                  }),
                  e.k0s()());
              },
              dependencies: [$.EJ, $.hL, $.K7, g.bA, An],
              encapsulation: 2,
              changeDetection: 0,
            });
          }
          return r;
        })();
      const H = {
        id: 'id',
        eventName: 'eventName',
        endpoint: 'endpoint',
        enabled: 'enabled',
        headers: 'headers',
        requestTimeout: 'requestTimeout',
        externalTenantId: 'externalTenantId',
        createdBy: 'createdBy',
        updatedBy: 'updatedBy',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        workUntilDate: 'workUntilDate',
      };
      var Mn = m(8344),
        At = m.n(Mn),
        Hn = m(2463),
        _e = m.n(Hn),
        Ft = m(152),
        Mt = m(3294);
      function Ht(r) {
        return {
          curPage: r.pageIndex,
          perPage: r.pageSize,
          sort: r.sort
            .filter((s) => s.value)
            .reduce(
              (s, t) =>
                'ascend' === t.value
                  ? { ...s, [t.key]: 'asc' }
                  : 'descend' === t.value
                  ? { ...s, [t.key]: 'desc' }
                  : s,
              {}
            ),
        };
      }
      function jt(r, s) {
        return {
          sort:
            0 === Object.keys(r.sort || {}).length
              ? s?.sort || { createdAt: 'desc' }
              : r.sort || {},
          curPage: r.curPage ? r.curPage : s?.curPage || 1,
          perPage: r.perPage ? r.perPage : s?.perPage || 5,
        };
      }
      let It = (() => {
          class r {
            transform(t) {
              return 'asc' === t ? 'ascend' : 'desc' === t ? 'descend' : null;
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵpipe = e.EJ8({
              name: 'nzTableSortOrderDetector',
              type: r,
              pure: !0,
            });
          }
          return r;
        })(),
        Xe = (() => {
          let r = class je {
            webhookRestService;
            webhookAuthCredentials$ = new T.t({});
            webhookUser$ = new T.t(null);
            constructor(t) {
              this.webhookRestService = t;
            }
            getWebhookAuthCredentials() {
              return this.webhookAuthCredentials$.value;
            }
            getWebhookUser() {
              return this.webhookUser$.value;
            }
            setWebhookAuthCredentials(t) {
              this.webhookAuthCredentials$.next(t),
                this.loadWebhookUser()
                  .pipe((0, S.s)(this))
                  .subscribe();
            }
            loadWebhookUser() {
              return this.webhookRestService
                .webhookControllerProfile(
                  this.getWebhookAuthCredentials().xExternalUserId,
                  this.getWebhookAuthCredentials().xExternalTenantId
                )
                .pipe(
                  (0, k.M)((t) => this.webhookUser$.next(t)),
                  (0, O.W)((t) =>
                    'WEBHOOK-002' === t.error?.code
                      ? (0, _.of)(null)
                      : (0, W.$)(() => t)
                  )
                );
            }
            webhookAuthCredentialsUpdates() {
              return this.webhookAuthCredentials$.asObservable();
            }
            webhookUserUpdates() {
              return this.webhookUser$.asObservable();
            }
            static ɵfac = function (n) {
              return new (n || je)(e.KVO(se));
            };
            static ɵprov = e.jDH({
              token: je,
              factory: je.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [se])],
              r
            )),
            r
          );
        })(),
        Ut = (() => {
          class r {
            webhookAuthService;
            webhookRestService;
            constructor(t, n) {
              (this.webhookAuthService = t), (this.webhookRestService = n);
            }
            findMany() {
              return this.webhookRestService.webhookControllerEvents(
                this.webhookAuthService.getWebhookAuthCredentials()
                  .xExternalUserId,
                this.webhookAuthService.getWebhookAuthCredentials()
                  .xExternalTenantId
              );
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(Xe), e.KVO(se));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        $t = (() => {
          let r = class Ie {
            webhookEventsService;
            translocoService;
            validationService;
            events = [];
            constructor(t, n, o) {
              (this.webhookEventsService = t),
                (this.translocoService = n),
                (this.validationService = o);
            }
            init() {
              return this.webhookEventsService.findMany().pipe(
                (0, k.M)((t) => {
                  this.events = t;
                })
              );
            }
            getFormlyFields(t) {
              return this.validationService.appendServerErrorsAsValidatorsToFields(
                [
                  {
                    key: H.enabled,
                    type: 'checkbox',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'webhook.form.fields.enabled'
                      ),
                      placeholder: 'enabled',
                      required: !0,
                    },
                  },
                  {
                    key: H.endpoint,
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'webhook.form.fields.endpoint'
                      ),
                      placeholder: 'endpoint',
                      required: !0,
                    },
                  },
                  {
                    key: H.eventName,
                    type: 'select',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'webhook.form.fields.event-name'
                      ),
                      placeholder: 'eventName',
                      required: !0,
                      options: (this.events || []).map((n) => ({
                        value: n.eventName,
                        label: `${n.eventName} - ${n.description}`,
                      })),
                    },
                  },
                  {
                    key: H.headers,
                    type: 'textarea',
                    validation: { show: !0 },
                    props: {
                      label: this.translocoService.translate(
                        'webhook.form.fields.headers'
                      ),
                      placeholder: 'headers',
                    },
                  },
                  {
                    key: H.requestTimeout,
                    type: 'input',
                    validation: { show: !0 },
                    props: {
                      type: 'number',
                      label: this.translocoService.translate(
                        'webhook.form.fields.request-timeout'
                      ),
                      placeholder: 'requestTimeout',
                      required: !1,
                    },
                  },
                  {
                    key: H.workUntilDate,
                    type: 'date-input',
                    validation: { show: !0 },
                    props: {
                      type: 'datetime-local',
                      label: this.translocoService.translate(
                        'webhook.form.fields.work-until-date'
                      ),
                      placeholder: 'workUntilDate',
                      required: !1,
                    },
                  },
                ],
                t?.errors || []
              );
            }
            static ɵfac = function (n) {
              return new (n || Ie)(e.KVO(Ut), e.KVO(g.JO), e.KVO(I));
            };
            static ɵprov = e.jDH({
              token: Ie,
              factory: Ie.ɵfac,
              providedIn: 'root',
            });
          };
          return (
            (r = (0, C.Cg)(
              [(0, S.d)(), (0, C.Sn)('design:paramtypes', [Ut, g.JO, I])],
              r
            )),
            r
          );
        })();
      function xn(r) {
        try {
          return JSON.parse(r);
        } catch {
          return r;
        }
      }
      var Ot = m(6541);
      let Je = (() => {
          class r {
            toModel(t) {
              return {
                ...t,
                headers: t?.headers ? JSON.stringify(t.headers) : '',
                requestTimeout: t?.requestTimeout ? +t.requestTimeout : null,
                workUntilDate: t?.workUntilDate
                  ? (0, oe.L)(new Date(t.workUntilDate), re)
                  : null,
                createdAt: t?.createdAt
                  ? (0, oe.L)(new Date(t.createdAt), re)
                  : null,
                updatedAt: t?.updatedAt
                  ? (0, oe.L)(new Date(t.updatedAt), re)
                  : null,
              };
            }
            toForm(t) {
              return {
                ...t,
                requestTimeout: t.requestTimeout ? t.requestTimeout : '',
                workUntilDate: t.workUntilDate
                  ? (0, Ot.GP)(t.workUntilDate, 'yyyy-MM-dd HH:mm:ss')
                  : null,
              };
            }
            toJson(t) {
              return {
                enabled: !0 === t.enabled,
                endpoint: t.endpoint || '',
                eventName: t.eventName || '',
                headers: t.headers ? xn(t.headers) : null,
                requestTimeout: t.requestTimeout ? +t.requestTimeout : null,
                workUntilDate: t.workUntilDate
                  ? (0, Ot.GP)(new Date(t.workUntilDate), 'yyyy-MM-dd HH:mm:ss')
                  : void 0,
              };
            }
            static ɵfac = function (n) {
              return new (n || r)();
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        ze = (() => {
          class r {
            webhookAuthService;
            webhookRestService;
            webhookMapperService;
            constructor(t, n, o) {
              (this.webhookAuthService = t),
                (this.webhookRestService = n),
                (this.webhookMapperService = o);
            }
            findOne(t) {
              return this.webhookRestService
                .webhookControllerFindOne(
                  t,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalUserId,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalTenantId
                )
                .pipe((0, z.T)(this.webhookMapperService.toModel));
            }
            findMany({ filters: t, meta: n }) {
              return (
                console.log('11', this.webhookRestService.defaultHeaders),
                this.webhookRestService
                  .webhookControllerFindMany(
                    this.webhookAuthService.getWebhookAuthCredentials()
                      .xExternalUserId,
                    this.webhookAuthService.getWebhookAuthCredentials()
                      .xExternalTenantId,
                    n?.curPage,
                    n?.perPage,
                    t.search,
                    n?.sort
                      ? Object.entries(n?.sort)
                          .map(([o, i]) => `${o}:${i}`)
                          .join(',')
                      : void 0
                  )
                  .pipe(
                    (0, z.T)(({ meta: o, webhooks: i }) => ({
                      meta: o,
                      webhooks: i.map(this.webhookMapperService.toModel),
                    }))
                  )
              );
            }
            updateOne(t, n) {
              return this.webhookRestService
                .webhookControllerUpdateOne(
                  t,
                  n,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalUserId,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalTenantId
                )
                .pipe((0, z.T)(this.webhookMapperService.toModel));
            }
            deleteOne(t) {
              return this.webhookRestService.webhookControllerDeleteOne(
                t,
                this.webhookAuthService.getWebhookAuthCredentials()
                  .xExternalUserId,
                this.webhookAuthService.getWebhookAuthCredentials()
                  .xExternalTenantId
              );
            }
            createOne(t) {
              return this.webhookRestService
                .webhookControllerCreateOne(
                  t,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalUserId,
                  this.webhookAuthService.getWebhookAuthCredentials()
                    .xExternalTenantId
                )
                .pipe((0, z.T)(this.webhookMapperService.toModel));
            }
            static ɵfac = function (n) {
              return new (n || r)(e.KVO(Xe), e.KVO(se), e.KVO(Je));
            };
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })();
      function jn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'nz-form-control')(1, 'button', 3),
            e.EFF(2),
            e.nI1(3, 'transloco'),
            e.nI1(4, 'transloco'),
            e.k0s()()),
          2 & r)
        ) {
          const t = e.XpG(2);
          e.R7$(),
            e.Y8G('disabled', !t.form.valid),
            e.R7$(),
            e.SpI(' ', t.id ? e.bMT(3, 2, 'Save') : e.bMT(4, 4, 'Create'), ' ');
        }
      }
      function In(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'form', 1),
            e.bIt('ngSubmit', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.submitForm());
            }),
            e.nrm(1, 'formly-form', 2),
            e.nI1(2, 'async'),
            e.DNE(3, jn, 5, 6, 'nz-form-control'),
            e.k0s();
        }
        if (2 & r) {
          const t = e.XpG();
          e.Y8G('formGroup', t.form),
            e.R7$(),
            e.Y8G('model', e.bMT(2, 5, t.formlyModel$))('fields', s)(
              'form',
              t.form
            ),
            e.R7$(2),
            e.vxM(t.hideButtons ? -1 : 3);
        }
      }
      let Un = (() => {
        let r = class tt {
          nzModalData;
          webhookService;
          nzMessageService;
          translocoService;
          webhookFormService;
          webhookMapperService;
          validationService;
          id;
          hideButtons;
          afterFind = new e.bkB();
          afterCreate = new e.bkB();
          afterUpdate = new e.bkB();
          form = new y.J3({});
          formlyModel$ = new T.t(null);
          formlyFields$ = new T.t(null);
          constructor(t, n, o, i, a, l, c) {
            (this.nzModalData = t),
              (this.webhookService = n),
              (this.nzMessageService = o),
              (this.translocoService = i),
              (this.webhookFormService = a),
              (this.webhookMapperService = l),
              (this.validationService = c);
          }
          ngOnInit() {
            Object.assign(this, this.nzModalData),
              this.webhookFormService
                .init()
                .pipe(
                  (0, M.Z)(() =>
                    this.id
                      ? this.findOne().pipe(
                          (0, k.M)((t) => this.afterFind.next({ ...t }))
                        )
                      : (this.setFieldsAndModel(), (0, _.of)(!0))
                  ),
                  (0, S.s)(this)
                )
                .subscribe();
          }
          setFieldsAndModel(t) {
            this.setFormlyFields(), this.formlyModel$.next(t || null);
          }
          submitForm() {
            this.id
              ? this.updateOne()
                  .pipe(
                    (0, k.M)((t) => {
                      t &&
                        (this.nzMessageService.success(
                          this.translocoService.translate('Success')
                        ),
                        this.afterUpdate.next({ ...t }));
                    }),
                    (0, S.s)(this)
                  )
                  .subscribe()
              : this.createOne()
                  .pipe(
                    (0, k.M)((t) => {
                      t &&
                        (this.nzMessageService.success(
                          this.translocoService.translate('Success')
                        ),
                        this.afterCreate.next({
                          ...t,
                          workUntilDate: t.workUntilDate
                            ? (0, oe.L)(new Date(t.workUntilDate), re)
                            : null,
                        }));
                    }),
                    (0, S.s)(this)
                  )
                  .subscribe();
          }
          createOne() {
            return this.webhookService
              .createOne(this.webhookMapperService.toJson(this.form.value))
              .pipe(
                (0, O.W)((t) =>
                  this.validationService.catchAndProcessServerError(t, (n) =>
                    this.setFormlyFields(n)
                  )
                )
              );
          }
          updateOne() {
            if (!this.id)
              throw new Error(this.translocoService.translate('id not set'));
            return this.webhookService
              .updateOne(
                this.id,
                this.webhookMapperService.toJson(this.form.value)
              )
              .pipe(
                (0, O.W)((t) =>
                  this.validationService.catchAndProcessServerError(t, (n) =>
                    this.setFormlyFields(n)
                  )
                )
              );
          }
          findOne() {
            if (!this.id)
              throw new Error(this.translocoService.translate('id not set'));
            return this.webhookService.findOne(this.id).pipe(
              (0, k.M)((t) => {
                this.setFieldsAndModel(this.webhookMapperService.toForm(t));
              })
            );
          }
          setFormlyFields(t) {
            this.formlyFields$.next(this.webhookFormService.getFormlyFields(t));
          }
          static ɵfac = function (n) {
            return new (n || tt)(
              e.rXU(G.or, 8),
              e.rXU(ze),
              e.rXU(N.xh),
              e.rXU(g.JO),
              e.rXU($t),
              e.rXU(Je),
              e.rXU(I)
            );
          };
          static ɵcmp = e.VBU({
            type: tt,
            selectors: [['webhook-form']],
            inputs: { id: 'id', hideButtons: 'hideButtons' },
            outputs: {
              afterFind: 'afterFind',
              afterCreate: 'afterCreate',
              afterUpdate: 'afterUpdate',
            },
            decls: 2,
            vars: 3,
            consts: [
              ['nz-form', '', 3, 'formGroup'],
              ['nz-form', '', 3, 'ngSubmit', 'formGroup'],
              [3, 'model', 'fields', 'form'],
              [
                'nzBlock',
                '',
                'nz-button',
                '',
                'nzType',
                'primary',
                'type',
                'submit',
                3,
                'disabled',
              ],
            ],
            template: function (n, o) {
              if (
                (1 & n && (e.DNE(0, In, 4, 7, 'form', 0), e.nI1(1, 'async')),
                2 & n)
              ) {
                let i;
                e.vxM((i = e.bMT(1, 1, o.formlyFields$)) ? 0 : -1, i);
              }
            },
            dependencies: [
              R.qy,
              R.aF,
              D.PQ,
              j.Uq,
              D.CA,
              D.zS,
              E.j,
              U.Zw,
              U.aO,
              q.c,
              Z.p,
              y.YN,
              y.qT,
              y.cb,
              y.X1,
              y.j4,
              V.Jj,
              g.Kj,
            ],
            encapsulation: 2,
            changeDetection: 0,
          });
        };
        return (
          (r = (0, C.Cg)(
            [
              (0, S.d)(),
              (0, C.Sn)('design:paramtypes', [r, ze, N.xh, g.JO, $t, Je, I]),
            ],
            r
          )),
          r
        );
      })();
      const $n = () => [1, 5, 10, 20, 30, 40],
        On = () => [],
        Vn = (r, s, t) => [r, s, t],
        Pn = () => ({ dateStyle: 'medium', timeStyle: 'medium' });
      function Rn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'button', 8),
            e.bIt('click', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.loadMany({ force: !0 }));
            }),
            e.nrm(1, 'span', 9),
            e.k0s();
        }
      }
      function Dn(r, s) {
        if (
          (1 & r && (e.nrm(0, 'th', 11), e.nI1(1, 'nzTableSortOrderDetector')),
          2 & r)
        ) {
          const t = s.$implicit,
            n = e.XpG(),
            o = e.XpG();
          e.Y8G('nzColumnKey', t)('nzSortFn', !0)(
            'nzSortOrder',
            e.bMT(1, 4, n.sort[t])
          )('transloco', o.columns[t]);
        }
      }
      function En(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'td'), e.EFF(1), e.nI1(2, 'translocoDate'), e.k0s()),
          2 & r)
        ) {
          const t = e.XpG().$implicit,
            n = e.XpG().$implicit;
          e.R7$(), e.SpI(' ', e.i5U(2, 1, +n[t], e.lJ4(4, Pn)), ' ');
        }
      }
      function Gn(r, s) {
        if ((1 & r && (e.j41(0, 'td'), e.EFF(1), e.k0s()), 2 & r)) {
          const t = e.XpG().$implicit,
            n = e.XpG().$implicit;
          e.R7$(), e.SpI(' ', n[t], ' ');
        }
      }
      function Ln(r, s) {
        if ((1 & r && e.DNE(0, En, 3, 5, 'td')(1, Gn, 2, 1, 'td'), 2 & r)) {
          const t = s.$implicit,
            n = e.XpG().$implicit,
            o = e.XpG(3);
          e.vxM(
            n[t] &&
              e
                .sMw(
                  1,
                  Vn,
                  o.WebhookScalarFieldEnumInterface.createdAt,
                  o.WebhookScalarFieldEnumInterface.updatedAt,
                  o.WebhookScalarFieldEnumInterface.workUntilDate
                )
                .includes(t)
              ? 0
              : 1
          );
        }
      }
      function Wn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'tr', 14),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(),
                a = e.XpG(2);
              return e.Njj(
                a.selectedIds$.next(o.id && i[0] !== o.id ? [o.id] : [])
              );
            }),
            e.Z7z(1, Ln, 2, 5, null, null, e.Vm6),
            e.j41(3, 'td')(4, 'a', 15),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(3);
              return e.Njj(i.showCreateOrUpdateModal(o.id));
            }),
            e.k0s(),
            e.nrm(5, 'nz-divider', 16),
            e.j41(6, 'a', 17),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(3);
              return e.Njj(i.showDeleteModal(o.id));
            }),
            e.k0s()()();
        }
        if (2 & r) {
          const t = s.$implicit,
            n = e.XpG(),
            o = e.XpG(2);
          e.AVh('selected', n[0] === t.id), e.R7$(), e.Dyx(o.keys);
        }
      }
      function Xn(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'tbody'), e.Z7z(1, Wn, 7, 2, 'tr', 13, e.Vm6), e.k0s()),
          2 & r)
        ) {
          e.XpG();
          const t = e.sdS(1);
          e.R7$(), e.Dyx(t.data);
        }
      }
      function Jn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'nz-table', 10, 1),
            e.nI1(2, 'async'),
            e.bIt('nzQueryParams', function (o) {
              e.eBV(t);
              const i = e.XpG();
              return e.Njj(i.loadMany({ queryParams: o }));
            }),
            e.j41(3, 'thead')(4, 'tr'),
            e.Z7z(5, Dn, 2, 6, 'th', 11, e.Vm6),
            e.nrm(7, 'th', 12),
            e.k0s()(),
            e.DNE(8, Xn, 3, 0, 'tbody'),
            e.nI1(9, 'async'),
            e.k0s();
        }
        if (2 & r) {
          let t;
          const n = s,
            o = e.XpG();
          e.Y8G('nzBordered', !0)('nzOuterBordered', !0)(
            'nzFrontPagination',
            !1
          )('nzPageSizeOptions', e.lJ4(13, $n))('nzPageIndex', n.curPage)(
            'nzPageSize',
            n.perPage
          )('nzTotal', n.totalResults || 0)(
            'nzData',
            e.bMT(2, 9, o.items$) || e.lJ4(14, On)
          ),
            e.R7$(5),
            e.Dyx(o.keys),
            e.R7$(3),
            e.vxM((t = e.bMT(9, 11, o.selectedIds$)) ? 8 : -1, t);
        }
      }
      let Bn = (() => {
        let r = class nt {
          webhookService;
          nzModalService;
          viewContainerRef;
          translocoService;
          items$ = new T.t([]);
          meta$ = new T.t(void 0);
          searchField = new y.MJ('');
          selectedIds$ = new T.t([]);
          keys = [
            H.id,
            H.enabled,
            H.endpoint,
            H.eventName,
            H.headers,
            H.requestTimeout,
            H.workUntilDate,
          ];
          columns = {
            [H.id]: (0, f.x)('webhook.grid.columns.id'),
            [H.enabled]: (0, f.x)('webhook.grid.columns.enabled'),
            [H.endpoint]: (0, f.x)('webhook.grid.columns.endpoint'),
            [H.eventName]: (0, f.x)('webhook.grid.columns.event-name'),
            [H.headers]: (0, f.x)('webhook.grid.columns.headers'),
            [H.requestTimeout]: (0, f.x)(
              'webhook.grid.columns.request-timeout'
            ),
            [H.workUntilDate]: (0, f.x)('webhook.grid.columns.work-until-date'),
          };
          WebhookScalarFieldEnumInterface = H;
          filters;
          constructor(t, n, o, i) {
            (this.webhookService = t),
              (this.nzModalService = n),
              (this.viewContainerRef = o),
              (this.translocoService = i),
              this.searchField.valueChanges
                .pipe(
                  (0, Ft.B)(700),
                  (0, Mt.F)(),
                  (0, k.M)(() => this.loadMany({ force: !0 })),
                  (0, S.s)(this)
                )
                .subscribe();
          }
          ngOnInit() {
            this.loadMany();
          }
          loadMany(t) {
            let n = { meta: {}, ...(t || {}) }.meta;
            const { queryParams: o, filters: i } = {
              filters: {},
              ...(t || {}),
            };
            !t?.force && o && (n = Ht(o)),
              (n = jt(n, this.meta$.value)),
              !i.search &&
                this.searchField.value &&
                (i.search = this.searchField.value),
              (t?.force ||
                !At()(
                  _e()(['totalResults'], { ...n, ...i }),
                  _e()(['totalResults'], {
                    ...this.meta$.value,
                    ...this.filters,
                  })
                )) &&
                this.webhookService
                  .findMany({ filters: i, meta: n })
                  .pipe(
                    (0, k.M)((a) => {
                      this.items$.next(a.webhooks),
                        this.meta$.next({ ...a.meta, ...n }),
                        (this.filters = i),
                        this.selectedIds$.next([]);
                    }),
                    (0, S.s)(this)
                  )
                  .subscribe();
          }
          showCreateOrUpdateModal(t) {
            const n = this.nzModalService.create({
              nzTitle: t
                ? this.translocoService.translate(
                    'webhook.update-modal.title',
                    { id: t }
                  )
                : this.translocoService.translate('webhook.create-modal.title'),
              nzContent: Un,
              nzViewContainerRef: this.viewContainerRef,
              nzData: { hideButtons: !0, id: t },
              nzFooter: [
                {
                  label: this.translocoService.translate('Cancel'),
                  onClick: () => {
                    n.close();
                  },
                },
                {
                  label: this.translocoService.translate(t ? 'Save' : 'Create'),
                  onClick: () => {
                    n.componentInstance?.afterUpdate
                      .pipe(
                        (0, k.M)(() => {
                          n.close(), this.loadMany({ force: !0 });
                        }),
                        (0, S.s)(n.componentInstance)
                      )
                      .subscribe(),
                      n.componentInstance?.afterCreate
                        .pipe(
                          (0, k.M)(() => {
                            n.close(), this.loadMany({ force: !0 });
                          }),
                          (0, S.s)(n.componentInstance)
                        )
                        .subscribe(),
                      n.componentInstance?.submitForm();
                  },
                  type: 'primary',
                },
              ],
            });
          }
          showDeleteModal(t) {
            t &&
              this.nzModalService.confirm({
                nzTitle: this.translocoService.translate(
                  'webhook.delete-modal.title',
                  { id: t }
                ),
                nzOkText: this.translocoService.translate('Yes'),
                nzCancelText: this.translocoService.translate('No'),
                nzOnOk: () => {
                  this.webhookService
                    .deleteOne(t)
                    .pipe(
                      (0, k.M)(() => {
                        this.loadMany({ force: !0 });
                      }),
                      (0, S.s)(this)
                    )
                    .subscribe();
                },
              });
          }
          static ɵfac = function (n) {
            return new (n || nt)(
              e.rXU(ze),
              e.rXU(G.N_),
              e.rXU(e.c1b),
              e.rXU(g.JO)
            );
          };
          static ɵcmp = e.VBU({
            type: nt,
            selectors: [['webhook-grid']],
            decls: 11,
            vars: 8,
            consts: [
              ['suffixIconButton', ''],
              ['basicTable', ''],
              [
                'nz-row',
                '',
                'nzJustify',
                'space-between',
                1,
                'table-operations',
              ],
              ['nz-col', '', 'nzSpan', '4'],
              [
                'nz-button',
                '',
                'nzType',
                'primary',
                'transloco',
                'Create new',
                3,
                'click',
              ],
              ['nzSearch', '', 3, 'nzAddOnAfter'],
              ['type', 'text', 'nz-input', '', 3, 'formControl', 'placeholder'],
              [
                'nzShowPagination',
                '',
                'nzShowSizeChanger',
                '',
                3,
                'nzBordered',
                'nzOuterBordered',
                'nzFrontPagination',
                'nzPageSizeOptions',
                'nzPageIndex',
                'nzPageSize',
                'nzTotal',
                'nzData',
              ],
              [
                'nz-button',
                '',
                'nzType',
                'primary',
                'nzSearch',
                '',
                3,
                'click',
              ],
              ['nz-icon', '', 'nzType', 'search'],
              [
                'nzShowPagination',
                '',
                'nzShowSizeChanger',
                '',
                3,
                'nzQueryParams',
                'nzBordered',
                'nzOuterBordered',
                'nzFrontPagination',
                'nzPageSizeOptions',
                'nzPageIndex',
                'nzPageSize',
                'nzTotal',
                'nzData',
              ],
              [3, 'nzColumnKey', 'nzSortFn', 'nzSortOrder', 'transloco'],
              ['transloco', 'Action'],
              [3, 'selected'],
              [3, 'click'],
              ['transloco', 'Edit', 3, 'click'],
              ['nzType', 'vertical'],
              ['transloco', 'Delete', 3, 'click'],
            ],
            template: function (n, o) {
              if (1 & n) {
                const i = e.RV6();
                e.j41(0, 'div', 2)(1, 'div', 3)(2, 'button', 4),
                  e.bIt('click', function () {
                    return e.eBV(i), e.Njj(o.showCreateOrUpdateModal());
                  }),
                  e.k0s()(),
                  e.j41(3, 'div', 3)(4, 'nz-input-group', 5),
                  e.nrm(5, 'input', 6),
                  e.nI1(6, 'transloco'),
                  e.k0s(),
                  e.DNE(7, Rn, 2, 0, 'ng-template', null, 0, e.C5r),
                  e.k0s()(),
                  e.DNE(9, Jn, 10, 15, 'nz-table', 7),
                  e.nI1(10, 'async');
              }
              if (2 & n) {
                let i;
                const a = e.sdS(8);
                e.R7$(4),
                  e.Y8G('nzAddOnAfter', a),
                  e.R7$(),
                  e.Y8G('formControl', o.searchField)(
                    'placeholder',
                    e.bMT(6, 4, 'input search text')
                  ),
                  e.R7$(4),
                  e.vxM((i = e.bMT(10, 6, o.meta$)) ? 9 : -1, i);
              }
            },
            dependencies: [
              j.f3,
              j.Uq,
              j.e,
              ne.GP,
              K.z6,
              F.$G,
              F.CP,
              F.Cc,
              F.SO,
              F._4,
              F.IL,
              F.aj,
              F.kt,
              he.g,
              he.j,
              V.MD,
              V.Jj,
              P.iI,
              G.U6,
              U.Zw,
              U.aO,
              q.c,
              Z.p,
              E.j,
              E.Sy,
              E.tg,
              ee.Y3,
              ee.Dn,
              y.YN,
              y.me,
              y.BC,
              y.X1,
              y.l_,
              It,
              g.bA,
              g.Kj,
              Q.IA,
            ],
            encapsulation: 2,
            changeDetection: 0,
          });
        };
        return (
          (r = (0, C.Cg)(
            [
              (0, S.d)(),
              (0, C.Sn)('design:paramtypes', [ze, G.N_, e.c1b, g.JO]),
            ],
            r
          )),
          r
        );
      })();
      const B = {
        id: 'id',
        request: 'request',
        responseStatus: 'responseStatus',
        response: 'response',
        webhookStatus: 'webhookStatus',
        webhookId: 'webhookId',
        externalTenantId: 'externalTenantId',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };
      let Vt = (() => {
        class r {
          webhookAuthService;
          webhookRestService;
          constructor(t, n) {
            (this.webhookAuthService = t), (this.webhookRestService = n);
          }
          findMany({ filters: t, meta: n }) {
            return this.webhookRestService.webhookControllerFindManyLogs(
              t.webhookId,
              this.webhookAuthService.getWebhookAuthCredentials()
                .xExternalUserId,
              this.webhookAuthService.getWebhookAuthCredentials()
                .xExternalTenantId,
              n?.curPage,
              n?.perPage,
              t.search,
              n?.sort
                ? Object.entries(n?.sort)
                    .map(([o, i]) => `${o}:${i}`)
                    .join(',')
                : void 0
            );
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(Xe), e.KVO(se));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      const Kn = (r) => ({ webhookId: r }),
        Nn = () => [1, 5, 10, 20, 30, 40],
        Yn = () => [],
        qn = (r, s) => [r, s],
        Zn = () => ({ dateStyle: 'medium', timeStyle: 'medium' });
      function Qn(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'button', 8),
            e.bIt('click', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.loadMany({ force: !0 }));
            }),
            e.nrm(1, 'span', 9),
            e.k0s();
        }
      }
      function er(r, s) {
        if (
          (1 & r && (e.nrm(0, 'th', 11), e.nI1(1, 'nzTableSortOrderDetector')),
          2 & r)
        ) {
          const t = s.$implicit,
            n = e.XpG(),
            o = e.XpG();
          e.Y8G('nzColumnKey', t)('nzSortFn', !0)(
            'nzSortOrder',
            e.bMT(1, 4, n.sort[t])
          )('transloco', o.columns[t]);
        }
      }
      function tr(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'td'), e.EFF(1), e.nI1(2, 'translocoDate'), e.k0s()),
          2 & r)
        ) {
          const t = e.XpG().$implicit,
            n = e.XpG(2).$implicit;
          e.R7$(), e.SpI(' ', e.i5U(2, 1, +n[t], e.lJ4(4, Zn)), ' ');
        }
      }
      function nr(r, s) {
        if ((1 & r && (e.j41(0, 'td'), e.EFF(1), e.k0s()), 2 & r)) {
          const t = e.XpG().$implicit,
            n = e.XpG(2).$implicit;
          e.R7$(), e.SpI(' ', n[t], ' ');
        }
      }
      function rr(r, s) {
        if ((1 & r && e.DNE(0, tr, 3, 5, 'td')(1, nr, 2, 1, 'td'), 2 & r)) {
          const t = s.$implicit,
            n = e.XpG(2).$implicit,
            o = e.XpG(3);
          e.vxM(
            n[t] &&
              e
                .l_i(
                  1,
                  qn,
                  o.WebhookLogScalarFieldEnumInterface.createdAt,
                  o.WebhookLogScalarFieldEnumInterface.updatedAt
                )
                .includes(t)
              ? 0
              : 1
          );
        }
      }
      function or(r, s) {
        if ((1 & r && e.Z7z(0, rr, 2, 4, null, null, e.Vm6), 2 & r)) {
          const t = e.XpG(4);
          e.Dyx(t.keys);
        }
      }
      function ir(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'tr', 13),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG(),
                a = e.XpG(2);
              return e.Njj(a.selectedIds$.next(i[0] === o.id ? [] : [o.id]));
            }),
            e.Z7z(1, or, 2, 0, null, null, e.Vm6),
            e.k0s();
        }
        if (2 & r) {
          const t = s.$implicit,
            n = e.XpG(),
            o = e.XpG(2);
          e.AVh('selected', n[0] === t.id), e.R7$(), e.Dyx(o.keys);
        }
      }
      function sr(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'tbody'), e.Z7z(1, ir, 3, 2, 'tr', 12, e.Vm6), e.k0s()),
          2 & r)
        ) {
          e.XpG();
          const t = e.sdS(1);
          e.R7$(), e.Dyx(t.data);
        }
      }
      function ar(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'nz-table', 10, 1),
            e.nI1(2, 'async'),
            e.bIt('nzQueryParams', function (o) {
              e.eBV(t);
              const i = e.XpG();
              return e.Njj(i.loadMany({ queryParams: o }));
            }),
            e.j41(3, 'thead')(4, 'tr'),
            e.Z7z(5, er, 2, 6, 'th', 11, e.Vm6),
            e.k0s()(),
            e.DNE(7, sr, 3, 0, 'tbody'),
            e.nI1(8, 'async'),
            e.k0s();
        }
        if (2 & r) {
          let t;
          const n = s,
            o = e.XpG();
          e.Y8G('nzBordered', !0)('nzOuterBordered', !0)(
            'nzFrontPagination',
            !1
          )('nzPageSizeOptions', e.lJ4(13, Nn))('nzPageIndex', n.curPage)(
            'nzPageSize',
            n.perPage
          )('nzTotal', n.totalResults || 0)(
            'nzData',
            e.bMT(2, 9, o.items$) || e.lJ4(14, Yn)
          ),
            e.R7$(5),
            e.Dyx(o.keys),
            e.R7$(2),
            e.vxM((t = e.bMT(8, 11, o.selectedIds$)) ? 7 : -1, t);
        }
      }
      let lr = (() => {
        let r = class rt {
          webhookLogService;
          webhookId;
          items$ = new T.t([]);
          meta$ = new T.t(void 0);
          searchField = new y.MJ('');
          selectedIds$ = new T.t([]);
          keys = [
            B.id,
            B.request,
            B.response,
            B.responseStatus,
            B.webhookStatus,
          ];
          columns = {
            [B.id]: (0, f.x)('webhook-log.grid.columns.id'),
            [B.request]: (0, f.x)('webhook-log.grid.columns.request'),
            [B.response]: (0, f.x)('webhook-log.grid.columns.response'),
            [B.responseStatus]: (0, f.x)(
              'webhook-log.grid.columns.response-status'
            ),
            [B.webhookStatus]: (0, f.x)(
              'webhook-log.grid.columns.webhook-status'
            ),
          };
          WebhookLogScalarFieldEnumInterface = B;
          filters;
          constructor(t) {
            (this.webhookLogService = t),
              this.searchField.valueChanges
                .pipe(
                  (0, Ft.B)(700),
                  (0, Mt.F)(),
                  (0, k.M)(() => this.loadMany({ force: !0 })),
                  (0, S.s)(this)
                )
                .subscribe();
          }
          ngOnChanges(t) {
            t.webhookId.firstChange
              ? this.loadMany()
              : this.loadMany({ force: !0 });
          }
          ngOnInit() {
            this.loadMany();
          }
          loadMany(t) {
            let n = { meta: {}, ...(t || {}) }.meta;
            const { queryParams: o, filters: i } = {
              filters: {},
              ...(t || {}),
            };
            !t?.force && o && (n = Ht(o)),
              (n = jt(n, this.meta$.value)),
              !i.search &&
                this.searchField.value &&
                (i.search = this.searchField.value),
              !i.webhookId && this.webhookId && (i.webhookId = this.webhookId),
              (t?.force ||
                !At()(
                  _e()(['totalResults'], { ...n, ...i }),
                  _e()(['totalResults'], {
                    ...this.meta$.value,
                    ...this.filters,
                  })
                )) &&
                (i.webhookId
                  ? this.webhookLogService
                      .findMany({ filters: i, meta: n })
                      .pipe(
                        (0, k.M)((a) => {
                          this.items$.next(
                            a.webhookLogs.map((l) => ({
                              ...l,
                              request: JSON.stringify(l.request),
                              response: JSON.stringify(l.response),
                            }))
                          ),
                            this.meta$.next({ ...a.meta, ...n }),
                            (this.filters = i),
                            this.selectedIds$.next([]);
                        }),
                        (0, S.s)(this)
                      )
                      .subscribe()
                  : (this.items$.next([]), this.selectedIds$.next([])));
          }
          static ɵfac = function (n) {
            return new (n || rt)(e.rXU(Vt));
          };
          static ɵcmp = e.VBU({
            type: rt,
            selectors: [['webhook-log-grid']],
            inputs: { webhookId: 'webhookId' },
            features: [e.OA$],
            decls: 12,
            vars: 14,
            consts: [
              ['suffixIconButton', ''],
              ['basicTable', ''],
              [
                'nz-row',
                '',
                'nzJustify',
                'space-between',
                1,
                'table-operations',
              ],
              ['nz-col', '', 'nzSpan', '6'],
              ['nz-col', '', 'nzSpan', '4'],
              ['nzSearch', '', 3, 'nzAddOnAfter'],
              ['type', 'text', 'nz-input', '', 3, 'formControl', 'placeholder'],
              [
                'nzShowPagination',
                '',
                'nzShowSizeChanger',
                '',
                3,
                'nzBordered',
                'nzOuterBordered',
                'nzFrontPagination',
                'nzPageSizeOptions',
                'nzPageIndex',
                'nzPageSize',
                'nzTotal',
                'nzData',
              ],
              [
                'nz-button',
                '',
                'nzType',
                'primary',
                'nzSearch',
                '',
                3,
                'click',
              ],
              ['nz-icon', '', 'nzType', 'search'],
              [
                'nzShowPagination',
                '',
                'nzShowSizeChanger',
                '',
                3,
                'nzQueryParams',
                'nzBordered',
                'nzOuterBordered',
                'nzFrontPagination',
                'nzPageSizeOptions',
                'nzPageIndex',
                'nzPageSize',
                'nzTotal',
                'nzData',
              ],
              [3, 'nzColumnKey', 'nzSortFn', 'nzSortOrder', 'transloco'],
              [3, 'selected'],
              [3, 'click'],
            ],
            template: function (n, o) {
              if (
                (1 & n &&
                  (e.j41(0, 'div', 2)(1, 'div', 3),
                  e.EFF(2),
                  e.nI1(3, 'transloco'),
                  e.k0s(),
                  e.j41(4, 'div', 4)(5, 'nz-input-group', 5),
                  e.nrm(6, 'input', 6),
                  e.nI1(7, 'transloco'),
                  e.k0s(),
                  e.DNE(8, Qn, 2, 0, 'ng-template', null, 0, e.C5r),
                  e.k0s()(),
                  e.DNE(10, ar, 9, 15, 'nz-table', 7),
                  e.nI1(11, 'async')),
                2 & n)
              ) {
                let i;
                const a = e.sdS(9);
                e.R7$(2),
                  e.SpI(
                    ' ',
                    e.i5U(
                      3,
                      5,
                      'Logs for webhook #{{webhookId}}',
                      e.eq3(12, Kn, o.webhookId)
                    ),
                    ' '
                  ),
                  e.R7$(3),
                  e.Y8G('nzAddOnAfter', a),
                  e.R7$(),
                  e.Y8G('formControl', o.searchField)(
                    'placeholder',
                    e.bMT(7, 8, 'input search text')
                  ),
                  e.R7$(4),
                  e.vxM((i = e.bMT(11, 10, o.meta$)) ? 10 : -1, i);
              }
            },
            dependencies: [
              j.f3,
              j.Uq,
              j.e,
              ne.GP,
              K.z6,
              F.$G,
              F.CP,
              F.Cc,
              F.SO,
              F._4,
              F.IL,
              F.aj,
              F.kt,
              he.g,
              V.MD,
              V.Jj,
              P.iI,
              G.U6,
              U.Zw,
              U.aO,
              q.c,
              Z.p,
              E.j,
              E.Sy,
              E.tg,
              ee.Y3,
              ee.Dn,
              y.YN,
              y.me,
              y.BC,
              y.X1,
              y.l_,
              It,
              g.bA,
              g.Kj,
              Q.IA,
            ],
            encapsulation: 2,
            changeDetection: 0,
          });
        };
        return (
          (r = (0, C.Cg)(
            [(0, S.d)(), (0, C.Sn)('design:paramtypes', [Vt])],
            r
          )),
          r
        );
      })();
      function cr(r, s) {
        if ((1 & r && e.nrm(0, 'webhook-log-grid', 5), 2 & r)) {
          const t = s.ngIf;
          e.Y8G('nzSpan', 24)('webhookId', t);
        }
      }
      let dr = (() => {
        class r {
          static ɵfac = function (n) {
            return new (n || r)();
          };
          static ɵcmp = e.VBU({
            type: r,
            selectors: [['app-webhooks']],
            decls: 7,
            vars: 4,
            consts: [
              ['webhookGrid', ''],
              ['transloco', 'Webhooks'],
              [1, 'inner-content'],
              ['nz-col', '', 3, 'nzSpan'],
              ['nz-col', '', 3, 'nzSpan', 'webhookId', 4, 'ngIf'],
              ['nz-col', '', 3, 'nzSpan', 'webhookId'],
            ],
            template: function (n, o) {
              if (
                (1 & n &&
                  (e.j41(0, 'nz-breadcrumb'),
                  e.nrm(1, 'nz-breadcrumb-item', 1),
                  e.k0s(),
                  e.j41(2, 'nz-row', 2),
                  e.nrm(3, 'webhook-grid', 3, 0),
                  e.DNE(5, cr, 1, 2, 'webhook-log-grid', 4),
                  e.nI1(6, 'async'),
                  e.k0s()),
                2 & n)
              ) {
                let i;
                const a = e.sdS(4);
                e.R7$(3),
                  e.Y8G('nzSpan', 24),
                  e.R7$(2),
                  e.Y8G(
                    'ngIf',
                    null == (i = e.bMT(6, 2, a.selectedIds$)) ? null : i[0]
                  );
              }
            },
            dependencies: [
              $.EJ,
              $.hL,
              $.K7,
              Bn,
              lr,
              j.f3,
              j.Uq,
              j.e,
              K.z6,
              V.Jj,
              V.bT,
              g.bA,
            ],
            encapsulation: 2,
            changeDetection: 0,
          });
        }
        return r;
      })();
      function ur(r, s) {
        if (
          (1 & r &&
            (e.j41(0, 'nz-form-control')(1, 'div', 3),
            e.nrm(2, 'div')(3, 'button', 4),
            e.k0s()()),
          2 & r)
        ) {
          const t = e.XpG(2);
          e.R7$(3), e.Y8G('disabled', !t.form.valid);
        }
      }
      function pr(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'form', 1),
            e.bIt('ngSubmit', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.submitForm());
            }),
            e.nrm(1, 'formly-form', 2),
            e.nI1(2, 'async'),
            e.DNE(3, ur, 4, 1, 'nz-form-control'),
            e.k0s();
        }
        if (2 & r) {
          const t = e.XpG();
          e.Y8G('formGroup', t.form),
            e.R7$(),
            e.Y8G('model', e.bMT(2, 5, t.formlyModel$))('fields', s)(
              'form',
              t.form
            ),
            e.R7$(2),
            e.vxM(t.hideButtons ? -1 : 3);
        }
      }
      let hr = (() => {
          let r = class ot {
            nzModalData;
            authService;
            nzMessageService;
            translocoService;
            authProfileFormService;
            authProfileMapperService;
            validationService;
            hideButtons;
            form = new y.J3({});
            formlyModel$ = new T.t(null);
            formlyFields$ = new T.t(null);
            constructor(t, n, o, i, a, l, c) {
              (this.nzModalData = t),
                (this.authService = n),
                (this.nzMessageService = o),
                (this.translocoService = i),
                (this.authProfileFormService = a),
                (this.authProfileMapperService = l),
                (this.validationService = c);
            }
            ngOnInit() {
              Object.assign(this, this.nzModalData),
                (0, be.h)(
                  this.authProfileFormService.init(),
                  this.translocoService.langChanges$
                )
                  .pipe(
                    (0, M.Z)(() => (this.fillFromProfile(), (0, _.of)(!0))),
                    (0, S.s)(this)
                  )
                  .subscribe();
            }
            setFieldsAndModel(t = {}) {
              const n = this.authProfileMapperService.toModel(t);
              this.setFormlyFields({ data: n }), this.formlyModel$.next(n);
            }
            setFormlyFields(t) {
              this.formlyFields$.next(
                this.authProfileFormService.getFormlyFields(t)
              );
            }
            submitForm() {
              if (this.form.valid) {
                const t = this.authProfileMapperService.toJson(this.form.value);
                this.authService
                  .updateProfile(t)
                  .pipe(
                    (0, k.M)(() => {
                      this.fillFromProfile(),
                        this.nzMessageService.success(
                          this.translocoService.translate('Updated')
                        );
                    }),
                    (0, O.W)((n) =>
                      this.validationService.catchAndProcessServerError(
                        n,
                        (o) => this.setFormlyFields(o)
                      )
                    ),
                    (0, O.W)(
                      (n) => (
                        console.error(n),
                        this.nzMessageService.error(n.message),
                        (0, _.of)(null)
                      )
                    ),
                    (0, S.s)(this)
                  )
                  .subscribe();
              } else
                console.log(this.form.controls),
                  this.nzMessageService.warning(
                    this.translocoService.translate('Validation errors')
                  );
            }
            fillFromProfile() {
              this.setFieldsAndModel(this.authService.profile$.value);
            }
            static ɵfac = function (n) {
              return new (n || ot)(
                e.rXU(G.or, 8),
                e.rXU(J),
                e.rXU(N.xh),
                e.rXU(g.JO),
                e.rXU(ve),
                e.rXU(ge),
                e.rXU(I)
              );
            };
            static ɵcmp = e.VBU({
              type: ot,
              selectors: [['auth-profile-form']],
              inputs: { hideButtons: 'hideButtons' },
              decls: 2,
              vars: 3,
              consts: [
                ['nz-form', '', 3, 'formGroup'],
                ['nz-form', '', 3, 'ngSubmit', 'formGroup'],
                [3, 'model', 'fields', 'form'],
                [1, 'flex', 'justify-between'],
                [
                  'nz-button',
                  '',
                  'nzType',
                  'primary',
                  'type',
                  'submit',
                  'transloco',
                  'Update',
                  3,
                  'disabled',
                ],
              ],
              template: function (n, o) {
                if (
                  (1 & n && (e.DNE(0, pr, 4, 7, 'form', 0), e.nI1(1, 'async')),
                  2 & n)
                ) {
                  let i;
                  e.vxM((i = e.bMT(1, 1, o.formlyFields$)) ? 0 : -1, i);
                }
              },
              dependencies: [
                R.qy,
                R.aF,
                D.PQ,
                j.Uq,
                D.CA,
                D.zS,
                E.j,
                U.Zw,
                U.aO,
                q.c,
                Z.p,
                y.YN,
                y.qT,
                y.cb,
                y.X1,
                y.j4,
                V.Jj,
                P.iI,
                g.bA,
              ],
              encapsulation: 2,
              changeDetection: 0,
            });
          };
          return (
            (r = (0, C.Cg)(
              [
                (0, S.d)(),
                (0, C.Sn)('design:paramtypes', [r, J, N.xh, g.JO, ve, ge, I]),
              ],
              r
            )),
            r
          );
        })(),
        Be = class it {
          static ɵfac = function (t) {
            return new (t || it)();
          };
          static ɵcmp = e.VBU({
            type: it,
            selectors: [['app-profile']],
            decls: 4,
            vars: 0,
            consts: [
              ['transloco', 'Profile'],
              [1, 'inner-content'],
            ],
            template: function (t, n) {
              1 & t &&
                (e.j41(0, 'nz-breadcrumb'),
                e.nrm(1, 'nz-breadcrumb-item', 0),
                e.k0s(),
                e.j41(2, 'div', 1),
                e.nrm(3, 'auth-profile-form'),
                e.k0s());
            },
            dependencies: [$.EJ, $.hL, $.K7, hr, g.bA],
            encapsulation: 2,
            changeDetection: 0,
          });
        };
      Be = (0, C.Cg)([(0, S.d)()], Be);
      const fr = [
        { path: '', redirectTo: '/home', pathMatch: 'full' },
        { path: 'home', component: Sn },
        { path: 'demo', component: yn },
        {
          path: 'webhooks',
          component: dr,
          canActivate: [Ce],
          data: { [ae]: new pe({ roles: ['Admin', 'User'] }) },
        },
        {
          path: 'profile',
          component: Be,
          canActivate: [Ce],
          data: { [ae]: new pe({ roles: ['Admin', 'User'] }) },
        },
        {
          path: 'sign-in',
          component: Tn,
          canActivate: [Ce],
          data: { [ae]: new pe({ roles: [] }) },
        },
        {
          path: 'sign-up',
          component: Fn,
          canActivate: [Ce],
          data: { [ae]: new pe({ roles: [] }) },
        },
      ];
      class mr {
        filesService;
        translocoService;
        tokensService;
        constructor(s, t, n) {
          (this.filesService = s),
            (this.translocoService = t),
            (this.tokensService = n);
        }
        getAuthorizationHeaders() {
          const s = this.translocoService.getActiveLang();
          return this.tokensService.getAccessToken()
            ? {
                Authorization: `Bearer ${this.tokensService.getAccessToken()}`,
                'Accept-language': s,
              }
            : { 'Accept-language': s };
        }
        beforeUpdateProfile(s) {
          return s.picture
            ? this.filesService
                .getPresignedUrlAndUploadFile(s.picture)
                .pipe((0, z.T)((t) => ({ ...s, picture: t })))
            : (0, _.of)({ ...s, picture: '' });
        }
        afterUpdateProfile(s) {
          return s.old?.picture && s.new?.picture !== s.old.picture
            ? this.filesService
                .deleteFile(s.old.picture)
                .pipe((0, z.T)(() => s.new))
            : (0, _.of)(s.new);
        }
      }
      let Ke = class Ue extends ve {
        translocoService;
        validationService;
        utcTimeZones = [
          { label: (0, f.x)('UTC\u221212:00: Date Line (west)'), value: -12 },
          { label: (0, f.x)('UTC\u221211:00: Niue, Samoa'), value: -11 },
          {
            label: (0, f.x)('UTC\u221210:00: Hawaii-Aleutian Islands'),
            value: -10,
          },
          { label: (0, f.x)('UTC\u221209:30: Marquesas Islands'), value: -9.5 },
          { label: (0, f.x)('UTC\u221209:00: Alaska'), value: -9 },
          {
            label: (0, f.x)('UTC\u221208:00: Pacific Time (US & Canada)'),
            value: -8,
          },
          {
            label: (0, f.x)('UTC\u221207:00: Mountain Time (US & Canada)'),
            value: -7,
          },
          {
            label: (0, f.x)(
              'UTC\u221206:00: Central Time (US & Canada), Mexico'
            ),
            value: -6,
          },
          {
            label: (0, f.x)(
              'UTC\u221205:00: Eastern Time (US & Canada), Bogota, Lima'
            ),
            value: -5,
          },
          {
            label: (0, f.x)(
              'UTC\u221204:00: Atlantic Time (Canada), Caracas, La Paz'
            ),
            value: -4,
          },
          { label: (0, f.x)('UTC\u221203:30: Newfoundland'), value: -3.5 },
          {
            label: (0, f.x)('UTC\u221203:00: Brazil, Buenos Aires, Georgetown'),
            value: -3,
          },
          { label: (0, f.x)('UTC\u221202:00: Mid-Atlantic Time'), value: -2 },
          {
            label: (0, f.x)('UTC\u221201:00: Azores, Cape Verde Islands'),
            value: -1,
          },
          {
            label: (0, f.x)(
              'UTC\xb100:00: Greenwich Mean Time (GMT), London, Lisbon'
            ),
            value: 0,
          },
          {
            label: (0, f.x)(
              'UTC+01:00: Central European Time, West African Time'
            ),
            value: 1,
          },
          {
            label: (0, f.x)(
              'UTC+02:00: Eastern European Time, Central African Time'
            ),
            value: 2,
          },
          {
            label: (0, f.x)('UTC+03:00: Moscow Time, East African Time'),
            value: 3,
          },
          { label: (0, f.x)('UTC+03:30: Tehran'), value: 3.5 },
          { label: (0, f.x)('UTC+04:00: Baku, Yerevan, Samara'), value: 4 },
          { label: (0, f.x)('UTC+04:30: Afghanistan'), value: 4.5 },
          {
            label: (0, f.x)(
              'UTC+05:00: Ekaterinburg, Islamabad, Karachi, Tashkent'
            ),
            value: 5,
          },
          {
            label: (0, f.x)('UTC+05:30: Mumbai, Kolkata, Madras, New Delhi'),
            value: 5.5,
          },
          { label: (0, f.x)('UTC+05:45: Nepal'), value: 5.75 },
          {
            label: (0, f.x)('UTC+06:00: Almaty, Dhaka, Novosibirsk'),
            value: 6,
          },
          { label: (0, f.x)('UTC+06:30: Cocos Islands, Myanmar'), value: 6.5 },
          { label: (0, f.x)('UTC+07:00: Bangkok, Hanoi, Jakarta'), value: 7 },
          {
            label: (0, f.x)('UTC+08:00: Beijing, Perth, Singapore, Hong Kong'),
            value: 8,
          },
          {
            label: (0, f.x)('UTC+08:45: Center and west Australia'),
            value: 8.75,
          },
          { label: (0, f.x)('UTC+09:00: Tokyo, Seoul, Yakutsk'), value: 9 },
          {
            label: (0, f.x)('UTC+09:30: Northern Territory, Eucla Adelaide'),
            value: 9.5,
          },
          {
            label: (0, f.x)('UTC+10:00: Eastern Australia, Guam, Vladivostok'),
            value: 10,
          },
          { label: (0, f.x)('UTC+10:30: Lord Howe Island'), value: 10.5 },
          {
            label: (0, f.x)(
              'UTC+11:00: Magadan, Solomon Islands, New Caledonia'
            ),
            value: 11,
          },
          { label: (0, f.x)('UTC+11:30: Norfolk Island'), value: 11.5 },
          {
            label: (0, f.x)('UTC+12:00: Fiji, Kamchatka, Marshall Islands'),
            value: 12,
          },
          { label: (0, f.x)('UTC+12:45: Chatham Islands'), value: 12.75 },
          { label: (0, f.x)('UTC+13:00: Samoa, Tonga'), value: 13 },
          { label: (0, f.x)('UTC+14:00: Date Line (east)'), value: 14 },
        ];
        constructor(s, t) {
          super(s, t),
            (this.translocoService = s),
            (this.validationService = t);
        }
        getFormlyFields(s) {
          return this.validationService.appendServerErrorsAsValidatorsToFields(
            [
              ...super.getFormlyFields(),
              {
                key: 'timezone',
                type: 'select',
                validation: { show: !0 },
                props: {
                  label: this.translocoService.translate(
                    'auth.sign-in-form.fields.timezone'
                  ),
                  placeholder: 'timezone',
                  required: !1,
                  options: this.utcTimeZones.map((t) => ({
                    ...t,
                    label: this.translocoService.translate(t.label),
                  })),
                },
              },
            ],
            s?.errors || []
          );
        }
        static ɵfac = function (t) {
          return new (t || Ue)(e.KVO(g.JO), e.KVO(I));
        };
        static ɵprov = e.jDH({
          token: Ue,
          factory: Ue.ɵfac,
          providedIn: 'root',
        });
      };
      Ke = (0, C.Cg)(
        [(0, S.d)(), (0, C.Sn)('design:paramtypes', [g.JO, I])],
        Ke
      );
      let br = (() => {
          class r extends ge {
            toModel(t) {
              return {
                old_password: t.old_password,
                new_password: t.new_password,
                confirm_new_password: t.confirm_new_password,
                picture: t.picture,
                timezone: t.timezone,
              };
            }
            toJson(t) {
              return {
                old_password: t.old_password,
                new_password: t.new_password,
                confirm_new_password: t.confirm_new_password,
                picture: t.picture,
                timezone: t.timezone,
              };
            }
            static ɵfac = (() => {
              let t;
              return function (o) {
                return (t || (t = e.xGo(r)))(o || r);
              };
            })();
            static ɵprov = e.jDH({
              token: r,
              factory: r.ɵfac,
              providedIn: 'root',
            });
          }
          return r;
        })(),
        Ne = class $e extends J {
          supabaseService;
          authRestService;
          tokensService;
          authConfiguration;
          constructor(s, t, n, o) {
            super(n, o),
              (this.supabaseService = s),
              (this.authRestService = t),
              (this.tokensService = n),
              (this.authConfiguration = o);
          }
          signUp(s) {
            if (!s.email) throw new Error('data.email not set');
            return (0, X.H)(
              this.supabaseService.auth.signUp({
                email: s.email.toLowerCase(),
                password: s.password,
                options: { emailRedirectTo: window.location.origin },
              })
            ).pipe(
              pt(),
              (0, M.Z)((t) => {
                if (!t.session) throw new Error('result.session not set');
                if (!t.user) throw new Error('result.user not set');
                if (!t.user.email) throw new Error('result.user.email not set');
                const n = {
                  access_token: t.session.access_token,
                  refresh_token: t.session.refresh_token,
                  expires_in: t.session.expires_in,
                  id_token: 'empty',
                  user: {
                    email: t.user.email,
                    email_verified: !0,
                    id: t.user.id,
                    preferred_username: 'empty',
                    signup_methods: 'empty',
                    created_at: +new Date(t.user.created_at),
                    updated_at: t.user.updated_at
                      ? +new Date(t.user.updated_at)
                      : 0,
                    roles: ['user'],
                    picture: t.user.user_metadata.picture,
                  },
                };
                return this.setProfileAndTokens(n).pipe(
                  (0, z.T)((o) => ({ profile: o, tokens: n }))
                );
              })
            );
          }
          fullUpdateProfile(s) {
            const t = this.profile$.value;
            return (
              this.authConfiguration?.beforeUpdateProfile
                ? this.authConfiguration.beforeUpdateProfile(s)
                : (0, _.of)(s)
            ).pipe(
              (0, M.Z)((n) =>
                (0, X.H)(
                  this.supabaseService.auth.updateUser({
                    data: { ...n.app_data, picture: n.picture },
                    email: n.email,
                    password: n.new_password,
                    phone: n.phone_number,
                  })
                )
              ),
              (function Kt() {
                return (0, z.T)((r) => {
                  const s = r.error?.message;
                  if (s)
                    throw 'unauthorized' === s
                      ? new Error((0, f.x)('Unauthorized'))
                      : new Error(s);
                  return r.data;
                });
              })(),
              (0, M.Z)((n) => {
                if (!n.user) throw new Error('result.user not set');
                if (!n.user.email) throw new Error('result.user.email not set');
                return this.setProfile({
                  email: n.user.email,
                  email_verified: !0,
                  id: n.user.id,
                  preferred_username: 'empty',
                  signup_methods: 'empty',
                  created_at: +new Date(n.user.created_at),
                  updated_at: n.user.updated_at
                    ? +new Date(n.user.updated_at)
                    : 0,
                  roles: ['user'],
                  picture: n.user.user_metadata.picture,
                });
              }),
              (0, M.Z)((n) =>
                this.authConfiguration?.afterUpdateProfile
                  ? this.authConfiguration.afterUpdateProfile({
                      new: n,
                      old: t,
                    })
                  : (0, _.of)({ new: n })
              )
            );
          }
          signIn(s) {
            if (!s.email) throw new Error('data.email not set');
            return (0, X.H)(
              this.supabaseService.auth.signInWithPassword({
                email: s.email,
                password: s.password,
              })
            ).pipe(
              (function Nt() {
                return (0, z.T)((r) => {
                  const s = r.error?.message;
                  if (s)
                    throw 'unauthorized' === s
                      ? new Error((0, f.x)('Unauthorized'))
                      : new Error(s);
                  return r.data;
                });
              })(),
              (0, M.Z)((t) => {
                if (!t.session) throw new Error('result.session not set');
                if (!t.user) throw new Error('result.user not set');
                if (!t.user.email) throw new Error('result.user.email not set');
                const n = {
                  access_token: t.session.access_token,
                  refresh_token: t.session.refresh_token,
                  expires_in: t.session.expires_in,
                  id_token: 'empty',
                  user: {
                    email: t.user.email,
                    email_verified: !0,
                    id: t.user.id,
                    preferred_username: 'empty',
                    signup_methods: 'empty',
                    created_at: +new Date(t.user.created_at),
                    updated_at: t.user.updated_at
                      ? +new Date(t.user.updated_at)
                      : 0,
                    roles: ['user'],
                    picture: t.user.user_metadata.picture,
                  },
                };
                return this.setProfileAndTokens(n).pipe(
                  (0, z.T)((o) => ({ profile: o, tokens: n }))
                );
              })
            );
          }
          signOut() {
            return (0, X.H)(
              this.supabaseService.auth.signOut({ scope: 'local' })
            ).pipe(
              (function Bt() {
                return (0, z.T)((r) => {
                  if (!r.error) return r.error;
                  throw new Error(r.error.message);
                });
              })(),
              (0, M.Z)(() => this.clearProfileAndTokens())
            );
          }
          refreshToken() {
            const s = this.tokensService.getRefreshToken();
            return s
              ? (0, X.H)(
                  this.supabaseService.auth.refreshSession({ refresh_token: s })
                ).pipe(
                  pt(),
                  (0, M.Z)((t) => {
                    if (!t.session) throw new Error('result.session not set');
                    if (!t.user) throw new Error('result.user not set');
                    if (!t.user.email)
                      throw new Error('result.user.email not set');
                    return this.setProfileAndTokens({
                      access_token: t.session.access_token,
                      refresh_token: t.session.refresh_token,
                      expires_in: t.session.expires_in,
                      id_token: 'empty',
                      user: {
                        email: t.user.email,
                        email_verified: !0,
                        id: t.user.id,
                        preferred_username: 'empty',
                        signup_methods: 'empty',
                        created_at: +new Date(t.user.created_at),
                        updated_at: t.user.updated_at
                          ? +new Date(t.user.updated_at)
                          : 0,
                        roles: ['user'],
                        picture: t.user.user_metadata.picture,
                      },
                    });
                  }),
                  (0, O.W)(
                    (t) => (console.error(t), this.clearProfileAndTokens())
                  )
                )
              : (0, _.of)(this.profile$.value);
          }
          setProfile(s) {
            return this.authRestService.authControllerProfile().pipe(
              (0, O.W)(() => (0, _.of)(null)),
              (0, M.Z)(
                (t) => (s && t && Object.assign(s, t), super.setProfile(s))
              )
            );
          }
          updateProfile(s) {
            const { timezone: t, ...n } = s;
            return this.fullUpdateProfile(n).pipe(
              (0, M.Z)((o) =>
                this.authRestService
                  .authControllerUpdateProfile({ timezone: t })
                  .pipe(
                    (0, z.T)(() => (o && Object.assign(o, { timezone: t }), o))
                  )
              )
            );
          }
          static ɵfac = function (t) {
            return new (t || $e)(e.KVO(ht), e.KVO(we), e.KVO(te), e.KVO(Oe, 8));
          };
          static ɵprov = e.jDH({
            token: $e,
            factory: $e.ɵfac,
            providedIn: 'root',
          });
        };
      Ne = (0, C.Cg)(
        [
          (0, S.d)(),
          (0, C.Sn)('design:paramtypes', [
            ht,
            we,
            te,
            class Wt {
              constructor(s) {
                Object.assign(this, s);
              }
            },
          ]),
        ],
        Ne
      );
      var yr = m(7468);
      let Sr = (() => {
        class r {
          httpClient;
          constructor(t) {
            this.httpClient = t;
          }
          getTranslation(t) {
            return (
              (t = t.split('-')[0]),
              (0, yr.p)({
                translation: this.httpClient
                  .get(`./assets/i18n/${t}.json`)
                  .pipe((0, O.W)(() => (0, _.of)({}))),
                vendors: this.httpClient
                  .get(`./assets/i18n/${t}.vendor.json`)
                  .pipe((0, O.W)(() => (0, _.of)({}))),
              }).pipe(
                (0, z.T)(({ translation: n, vendors: o }) => {
                  const i = { ...n };
                  for (const [, a] of Object.entries(o))
                    for (const [l, c] of Object.entries(a)) i[l] = i[l] || c;
                  for (const a in i)
                    if (Object.prototype.hasOwnProperty.call(i, a)) {
                      const l = i[a];
                      !l && 'empty' !== l && delete i[a];
                    }
                  return i;
                })
              )
            );
          }
          static ɵfac = function (n) {
            return new (n || r)(e.KVO(b.Qq));
          };
          static ɵprov = e.jDH({
            token: r,
            factory: r.ɵfac,
            providedIn: 'root',
          });
        }
        return r;
      })();
      var Cr = m(980),
        Tr = m(5558);
      const Ae = () => ({ float: 'right' }),
        _r = () => ({ dateStyle: 'medium', timeStyle: 'medium' });
      function zr(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.nrm(0, 'li', 10),
            e.j41(1, 'li', 5),
            e.nI1(2, 'transloco'),
            e.j41(3, 'ul'),
            e.nrm(4, 'li', 11),
            e.j41(5, 'li', 12),
            e.bIt('click', function () {
              e.eBV(t);
              const o = e.XpG();
              return e.Njj(o.signOut());
            }),
            e.k0s()()();
        }
        2 & r &&
          (e.R7$(),
          e.Aen(e.lJ4(6, Ae)),
          e.Y8G('nzTitle', e.i5U(2, 3, 'You are logged in as {{email}}', s)));
      }
      function Ar(r, s) {
        1 & r && e.nrm(0, 'li', 13)(1, 'li', 14),
          2 & r && (e.Aen(e.lJ4(4, Ae)), e.R7$(), e.Aen(e.lJ4(5, Ae)));
      }
      function Fr(r, s) {
        if (1 & r) {
          const t = e.RV6();
          e.j41(0, 'li', 15),
            e.bIt('click', function () {
              const o = e.eBV(t).$implicit,
                i = e.XpG();
              return e.Njj(i.setActiveLang(o.id));
            }),
            e.EFF(1),
            e.nI1(2, 'transloco'),
            e.k0s();
        }
        if (2 & r) {
          const t = s.$implicit;
          e.R7$(), e.SpI(' ', e.bMT(2, 1, t.label), ' ');
        }
      }
      let Ye = class st {
        timeRestService;
        appRestService;
        authService;
        router;
        translocoService;
        tokensService;
        authActiveLangService;
        title = (0, f.x)('client');
        serverMessage$ = new T.t('');
        serverTime$ = new T.t(new Date());
        authUser$;
        lang$ = new T.t('');
        availableLangs$ = new T.t([]);
        constructor(s, t, n, o, i, a, l) {
          (this.timeRestService = s),
            (this.appRestService = t),
            (this.authService = n),
            (this.router = o),
            (this.translocoService = i),
            (this.tokensService = a),
            (this.authActiveLangService = l);
        }
        ngOnInit() {
          this.subscribeToProfile(),
            this.loadAvailableLangs(),
            this.subscribeToLangChanges(),
            this.fillServerMessage()
              .pipe((0, S.s)(this))
              .subscribe(),
            this.fillServerTime()
              .pipe((0, S.s)(this))
              .subscribe();
        }
        setActiveLang(s) {
          this.authActiveLangService
            .setActiveLang(s)
            .pipe((0, S.s)(this))
            .subscribe();
        }
        signOut() {
          this.authService
            .signOut()
            .pipe(
              (0, k.M)(() => this.router.navigate(['/home'])),
              (0, S.s)(this)
            )
            .subscribe();
        }
        loadAvailableLangs() {
          this.availableLangs$.next(this.translocoService.getAvailableLangs());
        }
        subscribeToLangChanges() {
          this.translocoService.langChanges$
            .pipe(
              (0, k.M)((s) => this.lang$.next(s)),
              (0, M.Z)(() => this.fillServerMessage()),
              (0, S.s)(this)
            )
            .subscribe();
        }
        subscribeToProfile() {
          this.authUser$ = this.authService.profile$.asObservable();
        }
        fillServerTime() {
          return (0, be.h)(
            this.timeRestService.timeControllerTime(),
            this.tokensService
              .getStream()
              .pipe(
                (0, Tr.n)((s) =>
                  (function kr({ address: r, eventName: s, options: t }) {
                    const n = new WebSocket(
                      r.replace('/api', '').replace('http', 'ws'),
                      t
                    );
                    return new mt.c((o) => {
                      n.addEventListener('open', () => {
                        n.addEventListener('message', ({ data: i }) => {
                          o.next(JSON.parse(i.toString()));
                        }),
                          n.addEventListener('error', (i) => {
                            o.error(i),
                              n?.readyState == WebSocket.OPEN && n.close();
                          }),
                          n.send(JSON.stringify({ event: s, data: !0 }));
                      });
                    }).pipe(
                      (0, Cr.j)(() => {
                        n?.readyState == WebSocket.OPEN && n.close();
                      })
                    );
                  })({
                    address:
                      this.timeRestService.configuration.basePath +
                      (s?.access_token
                        ? `/ws/time?token=${s?.access_token}`
                        : '/ws/time'),
                    eventName: 'ChangeTimeStream',
                  })
                )
              )
              .pipe((0, z.T)((s) => s.data))
          ).pipe(
            (0, k.M)((s) => this.serverTime$.next((0, oe.L)(new Date(s), re)))
          );
        }
        fillServerMessage() {
          return this.appRestService
            .appControllerGetData()
            .pipe((0, k.M)((s) => this.serverMessage$.next(s.message)));
        }
        static ɵfac = function (t) {
          return new (t || st)(
            e.rXU(Re),
            e.rXU(Se),
            e.rXU(J),
            e.rXU(P.Ix),
            e.rXU(g.JO),
            e.rXU(te),
            e.rXU(De)
          );
        };
        static ɵcmp = e.VBU({
          type: st,
          selectors: [['app-root']],
          decls: 27,
          vars: 27,
          consts: [
            [1, 'layout'],
            [1, 'logo', 'flex', 'items-center', 'justify-center'],
            ['nz-menu', '', 'nzTheme', 'dark', 'nzMode', 'horizontal'],
            ['nz-menu-item', '', 'routerLink', '/home', 'transloco', 'Home'],
            ['nz-menu-item', '', 'routerLink', '/demo', 'transloco', 'Demo'],
            ['nz-submenu', '', 3, 'nzTitle'],
            ['nz-menu-item', '', 3, 'click', 4, 'ngFor', 'ngForOf'],
            [1, 'flex', 'justify-between'],
            ['id', 'serverMessage'],
            ['id', 'serverTime'],
            [
              'nz-menu-item',
              '',
              'routerLink',
              '/webhooks',
              'transloco',
              'Webhooks',
            ],
            [
              'nz-menu-item',
              '',
              'routerLink',
              '/profile',
              'transloco',
              'Profile',
            ],
            ['nz-menu-item', '', 'transloco', 'Sign-out', 3, 'click'],
            [
              'nz-menu-item',
              '',
              'routerLink',
              '/sign-up',
              'transloco',
              'Sign-up',
            ],
            [
              'nz-menu-item',
              '',
              'routerLink',
              '/sign-in',
              'transloco',
              'Sign-in',
            ],
            ['nz-menu-item', '', 3, 'click'],
          ],
          template: function (t, n) {
            if (
              (1 & t &&
                (e.j41(0, 'nz-layout', 0)(1, 'nz-header')(2, 'div', 1),
                e.EFF(3),
                e.nI1(4, 'transloco'),
                e.k0s(),
                e.j41(5, 'ul', 2),
                e.nrm(6, 'li', 3)(7, 'li', 4),
                e.DNE(8, zr, 6, 7),
                e.nI1(9, 'async'),
                e.DNE(10, Ar, 2, 6),
                e.j41(11, 'li', 5),
                e.nI1(12, 'async'),
                e.nI1(13, 'transloco'),
                e.j41(14, 'ul'),
                e.DNE(15, Fr, 3, 3, 'li', 6),
                e.nI1(16, 'async'),
                e.k0s()()()(),
                e.j41(17, 'nz-content'),
                e.nrm(18, 'router-outlet'),
                e.k0s(),
                e.j41(19, 'nz-footer', 7)(20, 'div', 8),
                e.EFF(21),
                e.nI1(22, 'async'),
                e.k0s(),
                e.j41(23, 'div', 9),
                e.EFF(24),
                e.nI1(25, 'async'),
                e.nI1(26, 'translocoDate'),
                e.k0s()()()),
              2 & t)
            ) {
              let o;
              e.R7$(3),
                e.SpI(' ', e.bMT(4, 8, n.title), ' '),
                e.R7$(5),
                e.vxM((o = e.bMT(9, 10, n.authUser$)) ? 8 : 10, o),
                e.R7$(3),
                e.Aen(e.lJ4(25, Ae)),
                e.Y8G('nzTitle', e.bMT(13, 14, e.bMT(12, 12, n.lang$))),
                e.R7$(4),
                e.Y8G('ngForOf', e.bMT(16, 16, n.availableLangs$)),
                e.R7$(6),
                e.JRh(e.bMT(22, 18, n.serverMessage$)),
                e.R7$(3),
                e.JRh(
                  e.i5U(26, 22, e.bMT(25, 20, n.serverTime$), e.lJ4(26, _r))
                );
            }
          },
          dependencies: [
            P.iI,
            P.n3,
            P.Wk,
            ne.GP,
            ne.jS,
            ne.CU,
            ne.Nu,
            K.z6,
            K.SH,
            K.Fx,
            K.N8,
            K.BU,
            We.kT,
            V.Jj,
            V.Sq,
            g.Kj,
            g.bA,
            Q.IA,
          ],
          encapsulation: 2,
          changeDetection: 0,
        });
      };
      (Ye = (0, C.Cg)(
        [
          (0, S.d)(),
          (0, C.Sn)('design:paramtypes', [Re, Se, J, P.Ix, g.JO, te, De]),
        ],
        Ye
      )),
        (0, me.B8)(
          Ye,
          (({ authorizerURL: r, minioURL: s }) => ({
            providers: [
              (0, me.$x)(),
              (0, e.Jn2)({ eventCoalescing: !0 }),
              (0, P.lh)(fr),
              (0, b.$R)(),
              (0, ce.provideNzI18n)(ce.en_US),
              {
                provide: Zt,
                useValue: new qt({
                  webhookSuperAdminExternalUserId:
                    '248ec37f-628d-43f0-8de2-f58da037dd0f',
                }),
              },
              (0, e.oKB)(
                Rt.wb,
                Dt.forRoot(
                  () =>
                    new L({
                      basePath: 'https://nestjs-mod-fullstack.vercel.app',
                    })
                ),
                R.qy.forRoot({ types: [...Yt, ...Xt] }),
                Qt.i
              ),
              { provide: e.zcH, useClass: an },
              { provide: lt, useValue: r },
              { provide: dt, useValue: yt },
              { provide: ut, useValue: St },
              { provide: vt, useValue: s },
              { provide: Oe, useClass: mr, deps: [bt, g.JO, te] },
              (0, g.$o)({
                config: {
                  availableLangs: [
                    {
                      id: (0, f.x)('en'),
                      label: (0, f.x)('app.locale.name.english'),
                    },
                    {
                      id: (0, f.x)('ru'),
                      label: (0, f.x)('app.locale.name.russian'),
                    },
                  ],
                  defaultLang: 'en',
                  fallbackLang: 'en',
                  reRenderOnLangChange: !0,
                  prodMode: !0,
                  missingHandler: {
                    logMissingKey: !0,
                    useFallbackTranslation: !0,
                    allowEmpty: !0,
                  },
                },
                loader: Sr,
              }),
              (0, Q.Ne)({
                defaultLocale: 'en-US',
                langToLocaleMapping: { en: 'en-US', ru: 'ru-RU' },
              }),
              (0, Pt.vj)({ locales: ['en-US', 'ru-RU'] }),
              (0, e.phd)(() =>
                (
                  (n) => () =>
                    n.resolve()
                )((0, e.WQX)(on))()
              ),
              { provide: ge, useClass: br },
              { provide: ve, useClass: Ke },
              { provide: J, useClass: Ne },
            ],
          }))({
            authorizerURL: 'http://localhost:8080',
            minioURL: 'https://gustcjgbrmmipkizqzso.supabase.co/storage/v1/s3',
            supabaseKey: St,
            supabaseURL: yt,
          })
        ).catch((r) => console.error(r));
    },
  },
  (le) => {
    le.O(0, ['vendor'], () => le((le.s = 8653))), le.O();
  },
]);
